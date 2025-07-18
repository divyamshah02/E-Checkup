document.addEventListener("DOMContentLoaded", () => {
  let allCases = []
  let filteredCases = []
  let currentPage = 1
  const rowsPerPage = 10

  let selectedCaseType = "all"
  let selectedStatusFilter = "all"
  let searchTerm = ""

  // DOM Elements
  const caseTypeCards = document.querySelectorAll(".stats-card[data-case-type]")
  const tableBody = document.getElementById("cases-table-body")
  const paginationControls = document.getElementById("pagination-controls")
  const searchInput = document.getElementById("searchInput")
  const sidebarToggle = document.getElementById("sidebarToggle")
  const sidebar = document.getElementById("sidebar")

  function initializeDashboard() {
    // Load mock data
    allCases = JSON.parse(localStorage.getItem("mockCases")) || []
    if (allCases.length === 0) {
      console.error("No mock cases found. Please ensure mock-data.js runs first.")
      return
    }

    updateAllStats()
    renderTable()
    addEventListeners()

    // Auto-refresh every 30 seconds
    setInterval(updateAllStats, 30000)
  }

  function updateAllStats() {
    // Update quick stats
    const totalCases = allCases.length
    const pendingCases = allCases.filter((c) => c.status === "pending").length
    const progressCases = allCases.filter((c) => c.status === "in-progress").length
    const completedCases = allCases.filter((c) => c.status === "completed").length

    document.getElementById("total-cases").textContent = totalCases
    document.getElementById("pending-cases").textContent = pendingCases
    document.getElementById("progress-cases").textContent = progressCases
    document.getElementById("completed-cases").textContent = completedCases

    // Update case type stats
    const caseTypes = ["vmer", "dc-visit", "online"]
    caseTypes.forEach((type) => {
      const casesOfType = allCases.filter((c) => c.type === type)
      const total = casesOfType.length
      const pending = casesOfType.filter((c) => c.status === "pending").length
      const completed = casesOfType.filter((c) => c.status === "completed").length

      const totalElement = document.getElementById(`${type}-total`)
      const pendingElement = document.getElementById(`${type}-pending`)
      const completedElement = document.getElementById(`${type}-completed`)

      if (totalElement) totalElement.textContent = total
      if (pendingElement) pendingElement.textContent = pending
      if (completedElement) completedElement.textContent = completed
    })
  }

  function applyFilters() {
    let tempCases = [...allCases]

    // Apply case type filter
    if (selectedCaseType !== "all") {
      tempCases = tempCases.filter((c) => c.type === selectedCaseType)
    }

    // Apply status filter
    if (selectedStatusFilter !== "all") {
      tempCases = tempCases.filter((c) => c.status === selectedStatusFilter)
    }

    // Apply search filter
    if (searchTerm) {
      tempCases = tempCases.filter(
        (c) =>
          c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.policyHolder.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    filteredCases = tempCases
    currentPage = 1
  }

  function renderTable() {
    applyFilters()

    // Pagination logic
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const paginatedCases = filteredCases.slice(startIndex, endIndex)

    // Update showing info
    document.getElementById("showing-start").textContent = filteredCases.length > 0 ? startIndex + 1 : 0
    document.getElementById("showing-end").textContent = Math.min(endIndex, filteredCases.length)
    document.getElementById("total-records").textContent = filteredCases.length

    // Render table rows
    if (paginatedCases.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-5">
            <div class="text-muted">
              <i class="fas fa-search fa-2x mb-3"></i>
              <p>No cases found matching your criteria.</p>
            </div>
          </td>
        </tr>`
    } else {
      tableBody.innerHTML = paginatedCases
        .map((caseItem) => {
          const statusInfo = getStatusInfo(caseItem.status)
          const typeInfo = getTypeInfo(caseItem.type)
          const priorityInfo = getPriorityInfo(caseItem.priority || "normal")

          const detailPage = getDetailPage(caseItem.type)

          return `
          <tr>
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
              <div class="d-flex align-items-center">
                <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px; font-size: 0.75rem;">
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
              <span class="badge badge-${priorityInfo.color}">${priorityInfo.label}</span>
            </td>
            <td class="text-end">
              <div class="btn-group btn-group-sm">
                <a href="${detailPage}?caseId=${caseItem.id}" class="btn btn-outline-primary">
                  <i class="fas fa-eye"></i>
                </a>
                <button class="btn btn-outline-secondary" onclick="editCase('${caseItem.id}')">
                  <i class="fas fa-edit"></i>
                </button>
                <div class="dropdown">
                  <button class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown"></button>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" onclick="assignCase('${caseItem.id}')"><i class="fas fa-user-plus me-2"></i>Reassign</a></li>
                    <li><a class="dropdown-item" href="#" onclick="downloadCase('${caseItem.id}')"><i class="fas fa-download me-2"></i>Download</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="archiveCase('${caseItem.id}')"><i class="fas fa-archive me-2"></i>Archive</a></li>
                  </ul>
                </div>
              </div>
            </td>
          </tr>`
        })
        .join("")
    }

    renderPagination()
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

  function addEventListeners() {
    // Case type card selection
    caseTypeCards.forEach((card) => {
      card.addEventListener("click", () => {
        caseTypeCards.forEach((c) => c.classList.remove("active"))
        card.classList.add("active")
        selectedCaseType = card.dataset.caseType
        renderTable()
      })
    })

    // Search functionality
    if (searchInput) {
      searchInput.addEventListener(
        "input",
        debounce((e) => {
          searchTerm = e.target.value
          renderTable()
        }, 300),
      )
    }

    // Filter dropdown
    document.querySelectorAll("[data-filter]").forEach((filter) => {
      filter.addEventListener("click", (e) => {
        e.preventDefault()
        selectedStatusFilter = e.target.dataset.filter
        renderTable()
      })
    })

    // Pagination
    if (paginationControls) {
      paginationControls.addEventListener("click", (e) => {
        e.preventDefault()
        if (e.target.tagName === "A" && !e.target.parentElement.classList.contains("disabled")) {
          currentPage = Number.parseInt(e.target.dataset.page)
          renderTable()
        }
      })
    }

    // Sidebar toggle for mobile
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("show")
      })
    }

    // Refresh button
    const refreshBtn = document.getElementById("refreshBtn")
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        updateAllStats()
        renderTable()
        showToast("Data refreshed successfully", "success")
      })
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
    // Simple toast notification (you can enhance this)
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

  // Global functions for button actions
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

  // Initialize dashboard
  initializeDashboard()
})
