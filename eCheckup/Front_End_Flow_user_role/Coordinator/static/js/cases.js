document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("coordinatorMockData"))
  if (!data) {
    console.error("Coordinator mock data not found in localStorage.")
    return
  }

  const allCases = data.cases
  let filteredCases = [...allCases]
  let currentPage = 1
  const rowsPerPage = 10

  // DOM Elements
  const searchInput = document.getElementById("searchInput")
  const typeFilter = document.getElementById("typeFilter")
  const statusFilter = document.getElementById("statusFilter")
  const clearFiltersBtn = document.getElementById("clearFilters")
  const tableBody = document.getElementById("casesTableBody")
  const paginationControls = document.getElementById("pagination-controls")

  function initializePage() {
    renderTable()
    addEventListeners()
  }

  function applyFilters() {
    let tempCases = [...allCases]

    // Search filter
    const searchTerm = searchInput.value.toLowerCase().trim()
    if (searchTerm) {
      tempCases = tempCases.filter(
        (c) => c.caseId.toLowerCase().includes(searchTerm) || c.policyHolder.toLowerCase().includes(searchTerm),
      )
    }

    // Type filter
    if (typeFilter.value) {
      tempCases = tempCases.filter((c) => c.caseType === typeFilter.value)
    }

    // Status filter
    if (statusFilter.value) {
      tempCases = tempCases.filter((c) => c.status === statusFilter.value)
    }

    filteredCases = tempCases
    currentPage = 1
  }

  function renderTable() {
    applyFilters()

    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const paginatedCases = filteredCases.slice(startIndex, endIndex)

    // Update showing info
    document.getElementById("showing-start").textContent = filteredCases.length > 0 ? startIndex + 1 : 0
    document.getElementById("showing-end").textContent = Math.min(endIndex, filteredCases.length)
    document.getElementById("total-records").textContent = filteredCases.length

    if (paginatedCases.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-5">No cases found matching your criteria.</td></tr>`
    } else {
      tableBody.innerHTML = paginatedCases
        .map((caseItem) => {
          const statusInfo = getStatusInfo(caseItem.status)
          const priorityInfo = getPriorityInfo(caseItem.priority)
          const caseTypeInfo = getCaseTypeInfo(caseItem.caseType)

          let detailPage = "#"
          switch (caseItem.caseType) {
            case "VMER":
              detailPage = "vmer-case-details.html"
              break
            case "DC Visit":
              detailPage = "dc-visit-case-details.html"
              break
            case "Online":
              detailPage = "online-case-details.html"
              break
          }

          return `
            <tr>
                <td><strong>${caseItem.caseId}</strong></td>
                <td>${caseItem.policyHolder}</td>
                <td><span class="badge badge-${caseTypeInfo.color}">${caseItem.caseType}</span></td>
                <td><span class="badge badge-${statusInfo.color}">${caseItem.status}</span></td>
                <td><span class="badge badge-${priorityInfo.color}">${caseItem.priority}</span></td>
                <td>${caseItem.assignedOn}</td>
                <td class="text-end">
                    <a href="${detailPage}?caseId=${caseItem.caseId}" class="btn btn-sm btn-secondary"><i class="fas fa-eye"></i> View</a>
                </td>
            </tr>
        `
        })
        .join("")
    }
    renderPagination()
  }

  function renderPagination() {
    const pageCount = Math.ceil(filteredCases.length / rowsPerPage)
    paginationControls.innerHTML = ""
    if (pageCount <= 1) return

    paginationControls.innerHTML += `<li class="page-item ${currentPage === 1 ? "disabled" : ""}"><a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a></li>`
    for (let i = 1; i <= pageCount; i++) {
      paginationControls.innerHTML += `<li class="page-item ${currentPage === i ? "active" : ""}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`
    }
    paginationControls.innerHTML += `<li class="page-item ${currentPage === pageCount ? "disabled" : ""}"><a class="page-link" href="#" data-page="${currentPage + 1}">Next</a></li>`
  }

  function addEventListeners() {
    searchInput.addEventListener("input", debounce(renderTable, 300))
    typeFilter.addEventListener("change", renderTable)
    statusFilter.addEventListener("change", renderTable)

    clearFiltersBtn.addEventListener("click", () => {
      searchInput.value = ""
      typeFilter.value = ""
      statusFilter.value = ""
      renderTable()
    })

    paginationControls.addEventListener("click", (e) => {
      e.preventDefault()
      if (e.target.tagName === "A" && !e.target.parentElement.classList.contains("disabled")) {
        currentPage = Number.parseInt(e.target.dataset.page)
        renderTable()
      }
    })
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

  // Helper functions for styling
  function getStatusInfo(status) {
    switch (status) {
      case "Tele-caller Assignment Pending":
        return { color: "primary" }
      case "Scheduling Pending":
        return { color: "warning" }
      case "Report Upload Pending":
        return { color: "info" }
      case "Sent to LIC":
        return { color: "secondary" }
      case "Completed":
        return { color: "success" }
      default:
        return { color: "secondary" }
    }
  }

  function getPriorityInfo(priority) {
    switch (priority) {
      case "Urgent":
        return { color: "danger" }
      case "High":
        return { color: "warning" }
      case "Normal":
        return { color: "primary" }
      default:
        return { color: "secondary" }
    }
  }

  function getCaseTypeInfo(caseType) {
    switch (caseType) {
      case "VMER":
        return { color: "info" }
      case "DC Visit":
        return { color: "success" }
      case "Online":
        return { color: "primary" }
      default:
        return { color: "secondary" }
    }
  }

  initializePage()
})
