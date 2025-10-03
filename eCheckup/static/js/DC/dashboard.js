let allCases = []
let filteredCases = []
let currentPage = 1
const rowsPerPage = 10

let selectedCaseType = "all"
let selectedStatusFilter = "all"
let searchTerm = ""
let csrfToken = ""
let caseApiUrl = ""
let case_detail_url = ""

// DOM Elements
const caseTypeCards = document.querySelectorAll(".stats-card[data-case-type]")
const tableBody = document.getElementById("cases-table-body")
const paginationControls = document.getElementById("pagination-controls")
const searchInput = document.getElementById("searchInput")
const sidebarToggle = document.getElementById("sidebarToggle")
const sidebar = document.getElementById("sidebar")

// Declare bootstrap object
const bootstrap = {
  Alert: function (element) {
    this.element = element
    this.close = function () {
      this.element.remove()
    }
  },
}

async function InitializeDashboard(token, apiUrl, caseDetailUrl) {
  csrfToken = token
  caseApiUrl = apiUrl
  case_detail_url = caseDetailUrl

  await loadData()
  addEventListeners()

  // Auto-refresh every 30 seconds
  setInterval(loadData, 30000)
}

async function loadData() {
  const [success, result] = await callApi("GET", `${caseApiUrl}?is_dashboard=dashboard`, null, csrfToken)
  if (success && result.success) {
    allCases = result.data.all_cases || []
    updateAllStats()
    renderTable()
  } else {
    console.error("Failed to load case data:", result.error)
    showToast("Failed to load case data.", "danger")
    tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5">
                    <div class="text-danger">
                        <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                        <p>Error loading data from the server.</p>
                        <p class="small">${result.error || "Please try refreshing the page."}</p>
                    </div>
                </td>
            </tr>`
  }
}

function updateAllStats() {
  // Update quick stats
  const totalCases = allCases.length
  const pendingCases = allCases.filter((c) => ["scheduled", "rescheduled"].includes(c.status)).length
  const progressCases = allCases.filter((c) => ["issue", "uploaded"].includes(c.status)).length
  const completedCases = allCases.filter((c) => ["submitted_to_lic", "completed"].includes(c.status)).length

  document.getElementById("total-cases").textContent = totalCases
  document.getElementById("pending-cases").textContent = pendingCases
  document.getElementById("progress-cases").textContent = progressCases
  document.getElementById("completed-cases").textContent = completedCases

  // Update case type stats
  // const caseTypes = ["vmer", "dc_visit", "online"]
  // caseTypes.forEach((type) => {
  //   const casesOfType = allCases.filter((c) => c.case_type === type)
  //   const total = casesOfType.length
  //   const pending = casesOfType.filter((c) => ["assigned", "scheduled", "rescheduled"].includes(c.status)).length
  //   const completed = casesOfType.filter((c) => ["uploaded", "submitted_to_lic", "completed"].includes(c.status)).length

  //   document.getElementById(`${type}-total`).textContent = total
  //   document.getElementById(`${type}-pending`).textContent = pending
  //   document.getElementById(`${type}-completed`).textContent = completed
  // })
}

function applyFilters() {
  let tempCases = [...allCases]

  // Apply case type filter
  if (selectedCaseType !== "all") {
    tempCases = tempCases.filter((c) => c.case_type === selectedCaseType)
  }

  // Apply status filter
  if (selectedStatusFilter !== "all") {
    if (selectedStatusFilter === "pending") {
      tempCases = tempCases.filter((c) => ["scheduled", "rescheduled"].includes(c.status))
    } else if (selectedStatusFilter === "in-progress") {
      tempCases = tempCases.filter((c) => ["uploaded", "issue"].includes(c.status))
    } else if (selectedStatusFilter === "completed") {
      tempCases = tempCases.filter((c) => ["submitted_to_lic", "completed"].includes(c.status))
    } else {
      tempCases = tempCases.filter((c) => c.status === selectedStatusFilter)
    }
  }

  // Apply search filter
  if (searchTerm) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    tempCases = tempCases.filter(
      (c) =>
        c.case_id.toLowerCase().includes(lowerCaseSearchTerm) ||
        c.holder_name.toLowerCase().includes(lowerCaseSearchTerm) ||
        (c.assigned_coordinator_name && c.assigned_coordinator_name.toLowerCase().includes(lowerCaseSearchTerm)),
    )
  }

  filteredCases = tempCases
  currentPage = 1
}

function renderTable() {
  applyFilters()

  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedCases = filteredCases.slice(startIndex, endIndex)

  document.getElementById("showing-start").textContent = filteredCases.length > 0 ? startIndex + 1 : 0
  document.getElementById("showing-end").textContent = Math.min(endIndex, filteredCases.length)
  document.getElementById("total-records").textContent = filteredCases.length

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
        let statusInfo = {}
        if (caseItem.case_type == 'both') {
          if (caseItem.case_stage != 'dc_visit') {
             statusInfo = { color: "success", label: "Completed" }
         } else {
            statusInfo = getStatusInfo(caseItem.status)
         }
        }
        else {
          statusInfo = getStatusInfo(caseItem.status)
        }        
        const typeInfo = getTypeInfo(caseItem.case_type)
        const priorityInfo = getPriorityInfo(caseItem.priority || "normal")
        const detailPageUrl = getDetailPage(caseItem.case_id) // Use case_id to generate URL
        const assignedTo = caseItem.assigned_telecaller_name || "N/A" // Placeholder

        return `
                <tr onclick="window.location = '${detailPageUrl}'">
                    <td>
                        <div class="fw-semibold">${caseItem.case_id}</div>
                        <div class="text-muted small">${caseItem.policy_number || "N/A"}</div>
                    </td>
                    <td>
                        <div class="fw-medium">${caseItem.holder_name}</div>
                        <div class="text-muted small">${caseItem.holder_phone || "N/A"}</div>
                    </td>                    
                    <td>
                        <span class="badge badge-${statusInfo.color}">${statusInfo.label}</span>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px; font-size: 0.75rem;">
                                ${assignedTo.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div class="fw-medium">${assignedTo}</div>
                                <div class="text-muted small">TeleCaller</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="fw-medium">${formatDate(caseItem.created_at)}</div>
                        <div class="text-muted small">${getTimeAgo(caseItem.created_at)}</div>
                    </td>
                    <td>
                        <span class="badge badge-${priorityInfo.color}">${priorityInfo.label}</span>
                    </td>
                    <td class="text-end">
                        <a href="${detailPageUrl}" class="btn btn-outline-primary">
                            <i class="fas fa-eye"></i>
                        </a>                        
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

  paginationControls.innerHTML += `<li class="page-item ${currentPage === 1 ? "disabled" : ""}"><a class="page-link" href="#" data-page="${currentPage - 1}"><i class="fas fa-chevron-left"></i></a></li>`

  const startPage = Math.max(1, currentPage - 2)
  const endPage = Math.min(pageCount, currentPage + 2)

  if (startPage > 1) {
    paginationControls.innerHTML += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`
    if (startPage > 2)
      paginationControls.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationControls.innerHTML += `<li class="page-item ${currentPage === i ? "active" : ""}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`
  }

  if (endPage < pageCount) {
    if (endPage < pageCount - 1)
      paginationControls.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`
    paginationControls.innerHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${pageCount}">${pageCount}</a></li>`
  }

  paginationControls.innerHTML += `<li class="page-item ${currentPage === pageCount ? "disabled" : ""}"><a class="page-link" href="#" data-page="${currentPage + 1}"><i class="fas fa-chevron-right"></i></a></li>`
}

function addEventListeners() {
  caseTypeCards.forEach((card) => {
    card.addEventListener("click", () => {
      caseTypeCards.forEach((c) => c.classList.remove("active"))
      card.classList.add("active")
      // A small change here: the first card will now represent "all" types
      const type = card.dataset.caseType
      selectedCaseType = type === "vmer" ? "all" : type // Assuming the first card is vmer and should show all
      if (card.querySelector(".stats-card-title").textContent.includes("VMER")) {
        selectedCaseType = "vmer"
      } else {
        selectedCaseType = card.dataset.caseType
      }
      renderTable()
    })
  })

  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce((e) => {
        searchTerm = e.target.value
        renderTable()
      }, 300),
    )
  }

  document.querySelectorAll("[data-filter]").forEach((filter) => {
    filter.addEventListener("click", (e) => {
      e.preventDefault()
      selectedStatusFilter = e.target.dataset.filter
      renderTable()
    })
  })

  if (paginationControls) {
    paginationControls.addEventListener("click", (e) => {
      e.preventDefault()
      const target = e.target.closest("a")
      if (target && !target.parentElement.classList.contains("disabled")) {
        currentPage = Number.parseInt(target.dataset.page)
        renderTable()
      }
    })
  }

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => sidebar.classList.toggle("show"))
  }

  const refreshBtn = document.getElementById("refreshBtn")
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      loadData()
      showToast("Data refreshed successfully", "success")
    })
  }
}

// Helper functions
function getStatusInfo(status) {
  const statusMap = {
    assigned: { color: "warning", label: "Pending" },
    scheduled: { color: "info", label: "Scheduled" },
    rescheduled: { color: "info", label: "Rescheduled" },
    issue: { color: "danger", label: "Issue" },
    uploaded: { color: "success", label: "Completed" },
    submitted_to_lic: { color: "success", label: "Completed" },
    completed: { color: "success", label: "Completed" },
  }
  return statusMap[status] || { color: "secondary", label: status }
}

function getTypeInfo(type) {
  const typeMap = {
    vmer: { color: "info", label: "VMER" },
    dc_visit: { color: "success", label: "DC Visit" },
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

function getDetailPage(caseId) {
  // This now returns the URL path instead of the filename  
  return `${case_detail_url}?case_id=${caseId}`
}

function formatDate(dateString) {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })
}

function getTimeAgo(dateString) {
  if (!dateString) return ""
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays <= 1) return "today"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return `${Math.floor(diffDays / 30)}m ago`
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
  const toastContainer = document.body
  const toast = document.createElement("div")
  toast.className = `alert alert-${type} position-fixed`
  toast.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: var(--shadow-lg);"
  toast.innerHTML = `
    <div class="d-flex align-items-center">
        <i class="fas fa-${type === "success" ? "check-circle" : "info-circle"} me-2"></i>
        ${message}
        <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`
  toastContainer.appendChild(toast)
  setTimeout(() => {
    const toastAlert = new bootstrap.Alert(toast)
    toastAlert.close()
  }, 5000)
}

// Global functions for button actions
window.editCase = (caseId) => showToast(`Edit case ${caseId}`, "info")
window.assignCase = (caseId) => showToast(`Reassign case ${caseId}`, "info")
window.downloadCase = (caseId) => showToast(`Downloading case ${caseId}`, "success")
window.archiveCase = (caseId) => {
  if (confirm(`Are you sure you want to archive case ${caseId}?`)) {
    showToast(`Case ${caseId} archived`, "warning")
  }
}
