document.addEventListener("DOMContentLoaded", () => {
  let allCases = []
  let filteredCases = []
  let currentPage = 1
  let rowsPerPage = 10
  const selectedCases = new Set()

  // DOM Elements
  const searchInput = document.getElementById("searchInput")
  const typeFilter = document.getElementById("typeFilter")
  const statusFilter = document.getElementById("statusFilter")
  const priorityFilter = document.getElementById("priorityFilter")
  const dateFilter = document.getElementById("dateFilter")
  const clearFiltersBtn = document.getElementById("clearFilters")
  const casesTableBody = document.getElementById("casesTableBody")
  const paginationControls = document.getElementById("paginationControls")
  const rowsPerPageSelect = document.getElementById("rowsPerPage")
  const selectAllCheckbox = document.getElementById("selectAll")
  const sidebarToggle = document.getElementById("sidebarToggle")
  const sidebar = document.getElementById("sidebar")

  function initializePage() {
    loadCases()
    updateStats()
    renderTable()
    addEventListeners()
  }

  function loadCases() {
    allCases = JSON.parse(localStorage.getItem("mockCases")) || []
    if (allCases.length === 0) {
      console.error("No mock cases found. Please ensure mock-data.js runs first.")
      return
    }
  }

  function updateStats() {
    const totalCases = allCases.length
    const activeCases = allCases.filter((c) => c.status === "in-progress" || c.status === "pending").length
    const completedToday = allCases.filter((c) => {
      const today = new Date().toISOString().split("T")[0]
      return c.status === "completed" && c.date === today
    }).length
    const overdueCases = allCases.filter((c) => {
      if (!c.dueDate) return false
      const dueDate = new Date(c.dueDate)
      const today = new Date()
      return dueDate < today && c.status !== "completed"
    }).length

    document.getElementById("totalCasesCount").textContent = totalCases
    document.getElementById("activeCasesCount").textContent = activeCases
    document.getElementById("completedTodayCount").textContent = completedToday
    document.getElementById("overdueCasesCount").textContent = overdueCases
  }

  function applyFilters() {
    let filtered = [...allCases]

    // Search filter
    const searchTerm = searchInput.value.toLowerCase().trim()
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.id.toLowerCase().includes(searchTerm) ||
          c.policyHolder.toLowerCase().includes(searchTerm) ||
          c.assignedTo.toLowerCase().includes(searchTerm) ||
          (c.details?.policyNumber && c.details.policyNumber.toLowerCase().includes(searchTerm)),
      )
    }

    // Type filter
    if (typeFilter.value) {
      filtered = filtered.filter((c) => c.type === typeFilter.value)
    }

    // Status filter
    if (statusFilter.value) {
      filtered = filtered.filter((c) => c.status === statusFilter.value)
    }

    // Priority filter
    if (priorityFilter.value) {
      filtered = filtered.filter((c) => (c.priority || "normal") === priorityFilter.value)
    }

    // Date filter
    if (dateFilter.value) {
      const today = new Date()
      const filterDate = new Date()

      switch (dateFilter.value) {
        case "today":
          filtered = filtered.filter((c) => c.date === today.toISOString().split("T")[0])
          break
        case "week":
          filterDate.setDate(today.getDate() - 7)
          filtered = filtered.filter((c) => new Date(c.date) >= filterDate)
          break
        case "month":
          filterDate.setMonth(today.getMonth() - 1)
          filtered = filtered.filter((c) => new Date(c.date) >= filterDate)
          break
        case "quarter":
          filterDate.setMonth(today.getMonth() - 3)
          filtered = filtered.filter((c) => new Date(c.date) >= filterDate)
          break
      }
    }

    filteredCases = filtered
    currentPage = 1
    updateCounts()
  }

  function updateCounts() {
    document.getElementById("showingCount").textContent = filteredCases.length
    document.getElementById("totalCount").textContent = allCases.length
  }

  function renderTable() {
    applyFilters()

    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const paginatedCases = filteredCases.slice(startIndex, endIndex)

    if (paginatedCases.length === 0) {
      casesTableBody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center py-5">
            <div class="text-muted">
              <i class="fas fa-search fa-3x mb-3"></i>
              <h5>No cases found</h5>
              <p>Try adjusting your search criteria or filters.</p>
            </div>
          </td>
        </tr>`
    } else {
      casesTableBody.innerHTML = paginatedCases
        .map((caseItem) => {
          const statusInfo = getStatusInfo(caseItem.status)
          const typeInfo = getTypeInfo(caseItem.type)
          const priorityInfo = getPriorityInfo(caseItem.priority || "normal")
          const detailPage = getDetailPage(caseItem.type)

          return `
          <tr>
            <td>
              <div class="form-check">
                <input class="form-check-input case-checkbox" type="checkbox" value="${caseItem.id}" 
                       ${selectedCases.has(caseItem.id) ? "checked" : ""}>
              </div>
            </td>
            <td>
              <div class="fw-semibold">${caseItem.id}</div>
              <div class="text-muted small">${caseItem.details?.policyNumber || "N/A"}</div>
            </td>
            <td>
              <div class="fw-medium">${caseItem.policyHolder}</div>
              <div class="text-muted small">${caseItem.details?.contact || "N/A"}</div>
            </td>
            <td>
              <span class="badge badge-${typeInfo.color}">${typeInfo.label}</span>
            </td>
            <td>
              <span class="badge badge-${statusInfo.color}">${statusInfo.label}</span>
            </td>
            <td>
              <span class="badge badge-${priorityInfo.color}">${priorityInfo.label}</span>
            </td>
            <td>
              <div class="d-flex align-items-center">
                <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                     style="width: 32px; height: 32px; font-size: 0.75rem;">
                  ${caseItem.assignedTo.charAt(0)}
                </div>
                <div>
                  <div class="fw-medium">${caseItem.assignedTo}</div>
                  <div class="text-muted small">Coordinator</div>
                </div>
              </div>
            </td>
            <td>
              <div class="fw-medium">${formatDate(caseItem.date)}</div>
              <div class="text-muted small">${getTimeAgo(caseItem.date)}</div>
            </td>
            <td>
              <div class="dropdown">
                <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="${detailPage}?caseId=${caseItem.id}">
                    <i class="fas fa-eye me-2"></i>View Details</a></li>
                  <li><a class="dropdown-item" href="#" onclick="editCase('${caseItem.id}')">
                    <i class="fas fa-edit me-2"></i>Edit Case</a></li>
                  <li><a class="dropdown-item" href="#" onclick="assignCase('${caseItem.id}')">
                    <i class="fas fa-user-plus me-2"></i>Reassign</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item" href="#" onclick="downloadCase('${caseItem.id}')">
                    <i class="fas fa-download me-2"></i>Download</a></li>
                  <li><a class="dropdown-item text-danger" href="#" onclick="archiveCase('${caseItem.id}')">
                    <i class="fas fa-archive me-2"></i>Archive</a></li>
                </ul>
              </div>
            </td>
          </tr>`
        })
        .join("")
    }

    renderPagination()
    updateSelectAllState()
  }

  function renderPagination() {
    const pageCount = Math.ceil(filteredCases.length / rowsPerPage)
    paginationControls.innerHTML = ""

    if (pageCount <= 1) return

    // Previous button
    paginationControls.innerHTML += `
      <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
        <a class="page-link" href="#" data-page="${currentPage - 1}">
          <i class="fas fa-chevron-left"></i>
        </a>
      </li>`

    // Page numbers
    const startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(pageCount, currentPage + 2)

    if (startPage > 1) {
      paginationControls.innerHTML += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`
      if (startPage > 2) {
        paginationControls.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationControls.innerHTML += `
        <li class="page-item ${currentPage === i ? "active" : ""}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>`
    }

    if (endPage < pageCount) {
      if (endPage < pageCount - 1) {
        paginationControls.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`
      }
      paginationControls.innerHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${pageCount}">${pageCount}</a></li>`
    }

    // Next button
    paginationControls.innerHTML += `
      <li class="page-item ${currentPage === pageCount ? "disabled" : ""}">
        <a class="page-link" href="#" data-page="${currentPage + 1}">
          <i class="fas fa-chevron-right"></i>
        </a>
      </li>`
  }

  function updateSelectAllState() {
    const checkboxes = document.querySelectorAll(".case-checkbox")
    const checkedBoxes = document.querySelectorAll(".case-checkbox:checked")

    if (checkboxes.length === 0) {
      selectAllCheckbox.indeterminate = false
      selectAllCheckbox.checked = false
    } else if (checkedBoxes.length === checkboxes.length) {
      selectAllCheckbox.indeterminate = false
      selectAllCheckbox.checked = true
    } else if (checkedBoxes.length > 0) {
      selectAllCheckbox.indeterminate = true
      selectAllCheckbox.checked = false
    } else {
      selectAllCheckbox.indeterminate = false
      selectAllCheckbox.checked = false
    }

    // Show bulk actions if cases are selected
    if (selectedCases.size > 0) {
      showBulkActionsBar()
    } else {
      hideBulkActionsBar()
    }
  }

  function showBulkActionsBar() {
    let bulkBar = document.getElementById("bulkActionsBar")
    if (!bulkBar) {
      bulkBar = document.createElement("div")
      bulkBar.id = "bulkActionsBar"
      bulkBar.className = "alert alert-info d-flex justify-content-between align-items-center mb-3"
      bulkBar.innerHTML = `
        <div>
          <i class="fas fa-check-circle me-2"></i>
          <span id="bulkSelectedCount">${selectedCases.size}</span> case(s) selected
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#bulkActionsModal">
            <i class="fas fa-cog me-1"></i>Actions
          </button>
          <button class="btn btn-sm btn-outline-secondary" onclick="clearSelection()">
            <i class="fas fa-times me-1"></i>Clear
          </button>
        </div>`
      document.querySelector(".content-body").insertBefore(bulkBar, document.querySelector(".card"))
    }
    document.getElementById("bulkSelectedCount").textContent = selectedCases.size
    document.getElementById("selectedCount").textContent = selectedCases.size
  }

  function hideBulkActionsBar() {
    const bulkBar = document.getElementById("bulkActionsBar")
    if (bulkBar) {
      bulkBar.remove()
    }
  }

  function addEventListeners() {
    // Search and filters
    searchInput.addEventListener("input", debounce(renderTable, 300))
    typeFilter.addEventListener("change", renderTable)
    statusFilter.addEventListener("change", renderTable)
    priorityFilter.addEventListener("change", renderTable)
    dateFilter.addEventListener("change", renderTable)

    // Clear filters
    clearFiltersBtn.addEventListener("click", () => {
      searchInput.value = ""
      typeFilter.value = ""
      statusFilter.value = ""
      priorityFilter.value = ""
      dateFilter.value = ""
      renderTable()
    })

    // Rows per page
    rowsPerPageSelect.addEventListener("change", (e) => {
      rowsPerPage = Number.parseInt(e.target.value)
      currentPage = 1
      renderTable()
    })

    // Pagination
    paginationControls.addEventListener("click", (e) => {
      e.preventDefault()
      if (e.target.tagName === "A" && !e.target.parentElement.classList.contains("disabled")) {
        currentPage = Number.parseInt(e.target.dataset.page)
        renderTable()
      }
    })

    // Select all checkbox
    selectAllCheckbox.addEventListener("change", (e) => {
      const checkboxes = document.querySelectorAll(".case-checkbox")
      checkboxes.forEach((checkbox) => {
        checkbox.checked = e.target.checked
        if (e.target.checked) {
          selectedCases.add(checkbox.value)
        } else {
          selectedCases.delete(checkbox.value)
        }
      })
      updateSelectAllState()
    })

    // Individual checkboxes
    document.addEventListener("change", (e) => {
      if (e.target.classList.contains("case-checkbox")) {
        if (e.target.checked) {
          selectedCases.add(e.target.value)
        } else {
          selectedCases.delete(e.target.value)
        }
        updateSelectAllState()
      }
    })

    // Sidebar toggle for mobile
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("show")
      })
    }

    // Export button
    document.getElementById("exportBtn").addEventListener("click", () => {
      exportCases()
    })

    // Sort functionality
    document.querySelectorAll("[data-sort]").forEach((sortBtn) => {
      sortBtn.addEventListener("click", (e) => {
        e.preventDefault()
        const sortType = e.target.dataset.sort
        sortCases(sortType)
      })
    })
  }

  function sortCases(sortType) {
    switch (sortType) {
      case "date-desc":
        filteredCases.sort((a, b) => new Date(b.date) - new Date(a.date))
        break
      case "date-asc":
        filteredCases.sort((a, b) => new Date(a.date) - new Date(b.date))
        break
      case "priority":
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 }
        filteredCases.sort((a, b) => priorityOrder[b.priority || "normal"] - priorityOrder[a.priority || "normal"])
        break
      case "status":
        filteredCases.sort((a, b) => a.status.localeCompare(b.status))
        break
      case "type":
        filteredCases.sort((a, b) => a.type.localeCompare(b.type))
        break
    }
    renderTable()
  }

  function exportCases() {
    const csvContent = generateCSV(filteredCases)
    downloadCSV(csvContent, "cases-export.csv")
    showToast("Cases exported successfully", "success")
  }

  function generateCSV(cases) {
    const headers = ["Case ID", "Policy Holder", "Type", "Status", "Priority", "Assigned To", "Date", "Policy Number"]
    const rows = cases.map((c) => [
      c.id,
      c.policyHolder,
      c.type,
      c.status,
      c.priority || "normal",
      c.assignedTo,
      c.date,
      c.details?.policyNumber || "N/A",
    ])

    return [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")
  }

  function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Helper functions
  function getStatusInfo(status) {
    const statusMap = {
      pending: { color: "warning", label: "Pending" },
      "in-progress": { color: "primary", label: "In Progress" },
      completed: { color: "success", label: "Completed" },
      cancelled: { color: "danger", label: "Cancelled" },
    }
    return statusMap[status] || { color: "secondary", label: "Unknown" }
  }

  function getTypeInfo(type) {
    const typeMap = {
      vmer: { color: "info", label: "VMER" },
      "dc-visit": { color: "success", label: "DC Visit" },
      online: { color: "warning", label: "Online" },
    }
    return typeMap[type] || { color: "secondary", label: "Unknown" }
  }

  function getPriorityInfo(priority) {
    const priorityMap = {
      urgent: { color: "danger", label: "Urgent" },
      high: { color: "warning", label: "High" },
      normal: { color: "primary", label: "Normal" },
      low: { color: "secondary", label: "Low" },
    }
    return priorityMap[priority] || { color: "primary", label: "Normal" }
  }

  function getDetailPage(type) {
    const pageMap = {
      vmer: "vmer-case-details.html",
      "dc-visit": "dc-visit-case-details.html",
      online: "online-case-details.html",
    }
    return pageMap[type] || "#"
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  function getTimeAgo(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  function showToast(message, type = "info") {
    const toast = document.createElement("div")
    toast.className = `alert alert-${type} position-fixed`
    toast.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 300px;"
    toast.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="fas fa-${type === "success" ? "check" : "info"}-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
      </div>`
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 5000)
  }

  // Global functions for actions
  window.editCase = (caseId) => {
    showToast(`Edit case ${caseId}`, "info")
  }

  window.assignCase = (caseId) => {
    showToast(`Reassign case ${caseId}`, "info")
  }

  window.downloadCase = (caseId) => {
    showToast(`Downloading case ${caseId}`, "success")
  }

  window.archiveCase = (caseId) => {
    if (confirm(`Are you sure you want to archive case ${caseId}?`)) {
      showToast(`Case ${caseId} archived`, "warning")
    }
  }

  window.clearSelection = () => {
    selectedCases.clear()
    document.querySelectorAll(".case-checkbox").forEach((cb) => (cb.checked = false))
    updateSelectAllState()
  }

  window.bulkAssign = () => {
    showToast(`Bulk assign ${selectedCases.size} cases`, "info")
  }

  window.bulkStatusUpdate = () => {
    showToast(`Update status for ${selectedCases.size} cases`, "info")
  }

  window.bulkExport = () => {
    const selectedCaseData = allCases.filter((c) => selectedCases.has(c.id))
    const csvContent = generateCSV(selectedCaseData)
    downloadCSV(csvContent, "selected-cases-export.csv")
    showToast(`Exported ${selectedCases.size} selected cases`, "success")
  }

  window.bulkArchive = () => {
    if (confirm(`Are you sure you want to archive ${selectedCases.size} selected cases?`)) {
      showToast(`Archived ${selectedCases.size} cases`, "warning")
      window.clearSelection()
    }
  }

  // Initialize the page
  initializePage()
})
