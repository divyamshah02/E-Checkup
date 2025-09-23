// Cases Management JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Sample cases data
  const casesData = [
    {
      id: "LIC-2024-001",
      policyHolder: "Rajesh Kumar",
      policyNumber: "POL-2024-789456",
      type: "vmer",
      status: "in-progress",
      priority: "high",
      coordinator: "Sarah Johnson",
      teleCaller: "Mike Caller",
      created: "2024-01-15",
      expectedCompletion: "2024-01-22",
      phone: "+91 9876543210",
      email: "rajesh.kumar@email.com",
      age: 45,
      address: "123 MG Road, Mumbai",
      progress: 30,
    },
    {
      id: "LIC-2024-002",
      policyHolder: "Priya Sharma",
      policyNumber: "POL-2024-789457",
      type: "dc-visit",
      status: "new",
      priority: "medium",
      coordinator: "David Chen",
      teleCaller: "Lisa Patel",
      created: "2024-01-16",
      expectedCompletion: "2024-01-25",
      phone: "+91 9876543211",
      email: "priya.sharma@email.com",
      age: 38,
      address: "456 Park Street, Delhi",
      progress: 0,
    },
    {
      id: "LIC-2024-003",
      policyHolder: "Amit Patel",
      policyNumber: "POL-2024-789458",
      type: "vmer",
      status: "completed",
      priority: "low",
      coordinator: "Sarah Johnson",
      teleCaller: "Mike Caller",
      created: "2024-01-10",
      expectedCompletion: "2024-01-17",
      phone: "+91 9876543212",
      email: "amit.patel@email.com",
      age: 52,
      address: "789 Brigade Road, Bangalore",
      progress: 100,
    },
    {
      id: "LIC-2024-004",
      policyHolder: "Sunita Gupta",
      policyNumber: "POL-2024-789459",
      type: "dc-visit",
      status: "on-hold",
      priority: "high",
      coordinator: "David Chen",
      teleCaller: "Lisa Patel",
      created: "2024-01-12",
      expectedCompletion: "2024-01-20",
      phone: "+91 9876543213",
      email: "sunita.gupta@email.com",
      age: 41,
      address: "321 CP Road, Pune",
      progress: 60,
    },
    {
      id: "LIC-2024-005",
      policyHolder: "Ravi Singh",
      policyNumber: "POL-2024-789460",
      type: "vmer",
      status: "in-progress",
      priority: "medium",
      coordinator: "Sarah Johnson",
      teleCaller: "Mike Caller",
      created: "2024-01-14",
      expectedCompletion: "2024-01-21",
      phone: "+91 9876543214",
      email: "ravi.singh@email.com",
      age: 35,
      address: "654 Mall Road, Chandigarh",
      progress: 45,
    },
    {
      id: "LIC-2024-006",
      policyHolder: "Meera Joshi",
      policyNumber: "POL-2024-789461",
      type: "dc-visit",
      status: "completed",
      priority: "low",
      coordinator: "David Chen",
      teleCaller: "Lisa Patel",
      created: "2024-01-08",
      expectedCompletion: "2024-01-15",
      phone: "+91 9876543215",
      email: "meera.joshi@email.com",
      age: 29,
      address: "987 FC Road, Pune",
      progress: 100,
    },
    {
      id: "LIC-2024-007",
      policyHolder: "Vikram Reddy",
      policyNumber: "POL-2024-789462",
      type: "vmer",
      status: "new",
      priority: "high",
      coordinator: "Sarah Johnson",
      teleCaller: "Mike Caller",
      created: "2024-01-17",
      expectedCompletion: "2024-01-24",
      phone: "+91 9876543216",
      email: "vikram.reddy@email.com",
      age: 47,
      address: "147 Jubilee Hills, Hyderabad",
      progress: 0,
    },
    {
      id: "LIC-2024-008",
      policyHolder: "Kavita Nair",
      policyNumber: "POL-2024-789463",
      type: "dc-visit",
      status: "in-progress",
      priority: "medium",
      coordinator: "David Chen",
      teleCaller: "Lisa Patel",
      created: "2024-01-13",
      expectedCompletion: "2024-01-20",
      phone: "+91 9876543217",
      email: "kavita.nair@email.com",
      age: 33,
      address: "258 MG Road, Kochi",
      progress: 25,
    },
  ]

  let filteredCases = [...casesData]
  let currentView = "card"
  let currentPage = 1
  const casesPerPage = 6

  // Initialize the page
  init()

  function init() {
    renderCases()
    renderPagination()
    updateStats()
  }

  function renderCases() {
    if (currentView === "card") {
      renderCardView()
    } else {
      renderTableView()
    }
  }

  function renderCardView() {
    const container = document.getElementById("casesContainer")
    const startIndex = (currentPage - 1) * casesPerPage
    const endIndex = startIndex + casesPerPage
    const casesToShow = filteredCases.slice(startIndex, endIndex)

    container.innerHTML = casesToShow
      .map(
        (caseItem) => `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card case-card priority-${caseItem.priority}" onclick="viewCaseDetails('${caseItem.id}')">
                    <div class="card-header bg-white d-flex justify-content-between align-items-center">
                        <h6 class="mb-0 fw-bold text-primary-custom">${caseItem.id}</h6>
                        <div class="d-flex gap-1">
                            <span class="badge bg-${getStatusColor(caseItem.status)} badge-status">${formatStatus(caseItem.status)}</span>
                            <span class="badge bg-${getPriorityColor(caseItem.priority)} badge-status">${caseItem.priority.toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <img src="/placeholder.svg?height=40&width=40&text=${caseItem.policyHolder.charAt(0)}" class="rounded-circle me-3" width="40" height="40" alt="Policy Holder">
                            <div>
                                <h6 class="mb-0 fw-medium">${caseItem.policyHolder}</h6>
                                <small class="text-muted">${caseItem.policyNumber}</small>
                            </div>
                        </div>
                        
                        <div class="row g-2 mb-3">
                            <div class="col-6">
                                <small class="text-muted d-block">Type</small>
                                <span class="badge bg-${caseItem.type === "vmer" ? "info" : "secondary"} badge-status">${caseItem.type.toUpperCase()}</span>
                            </div>
                            <div class="col-6">
                                <small class="text-muted d-block">Age</small>
                                <span class="fw-medium">${caseItem.age} years</span>
                            </div>
                        </div>

                        <div class="mb-3">
                            <small class="text-muted d-block">Coordinator</small>
                            <span class="fw-medium">${caseItem.coordinator}</span>
                        </div>

                        <div class="mb-3">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <small class="text-muted">Progress</small>
                                <small class="text-muted fw-medium">${caseItem.progress}%</small>
                            </div>
                            <div class="progress" style="height: 6px;">
                                <div class="progress-bar bg-${getProgressColor(caseItem.progress)}" 
                                     style="width: ${caseItem.progress}%"></div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="fas fa-calendar-alt me-1"></i>
                                ${formatDate(caseItem.created)}
                            </small>
                            <div class="btn-group" role="group">
                                <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); editCase('${caseItem.id}')" title="Edit Case">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-success" onclick="event.stopPropagation(); contactPolicyHolder('${caseItem.id}')" title="Contact">
                                    <i class="fas fa-phone"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  function renderTableView() {
    const tbody = document.getElementById("casesTableBody")
    const startIndex = (currentPage - 1) * casesPerPage
    const endIndex = startIndex + casesPerPage
    const casesToShow = filteredCases.slice(startIndex, endIndex)

    tbody.innerHTML = casesToShow
      .map(
        (caseItem) => `
            <tr onclick="viewCaseDetails('${caseItem.id}')" style="cursor: pointer;">
                <td>
                    <strong class="text-primary-custom">${caseItem.id}</strong><br>
                    <small class="text-muted">${caseItem.policyNumber}</small>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="/placeholder.svg?height=32&width=32&text=${caseItem.policyHolder.charAt(0)}" class="rounded-circle me-2" width="32" height="32" alt="Policy Holder">
                        <div>
                            <div class="fw-medium">${caseItem.policyHolder}</div>
                            <small class="text-muted">${caseItem.age} years</small>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge bg-${caseItem.type === "vmer" ? "info" : "secondary"} badge-status">${caseItem.type.toUpperCase()}</span>
                </td>
                <td>
                    <span class="status-indicator status-${caseItem.status}"></span>
                    <span class="badge bg-${getStatusColor(caseItem.status)} badge-status">${formatStatus(caseItem.status)}</span>
                </td>
                <td>
                    <span class="badge bg-${getPriorityColor(caseItem.priority)} badge-status">${caseItem.priority.toUpperCase()}</span>
                </td>
                <td class="fw-medium">${caseItem.coordinator}</td>
                <td>
                    <div class="fw-medium">${formatDate(caseItem.created)}</div>
                    <small class="text-muted">Due: ${formatDate(caseItem.expectedCompletion)}</small>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); editCase('${caseItem.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="event.stopPropagation(); contactPolicyHolder('${caseItem.id}')" title="Contact">
                            <i class="fas fa-phone"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="event.stopPropagation(); viewCaseDetails('${caseItem.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `,
      )
      .join("")
  }

  function renderPagination() {
    const totalPages = Math.ceil(filteredCases.length / casesPerPage)
    const pagination = document.getElementById("pagination")

    if (totalPages <= 1) {
      pagination.innerHTML = ""
      return
    }

    let paginationHTML = ""

    // Previous button
    paginationHTML += `
            <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
                <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
            </li>
        `

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        paginationHTML += `
                    <li class="page-item ${i === currentPage ? "active" : ""}">
                        <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                    </li>
                `
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`
      }
    }

    // Next button
    paginationHTML += `
            <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
                <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
            </li>
        `

    pagination.innerHTML = paginationHTML
  }

  function updateStats() {
    const stats = {
      total: filteredCases.length,
      new: filteredCases.filter((c) => c.status === "new").length,
      inProgress: filteredCases.filter((c) => c.status === "in-progress").length,
      completed: filteredCases.filter((c) => c.status === "completed").length,
      onHold: filteredCases.filter((c) => c.status === "on-hold").length,
    }

    // Update stats cards
    document.querySelector(".stats-card:nth-child(1) h3").textContent = stats.total
    document.querySelector(".stats-card:nth-child(2) h3").textContent = stats.inProgress
    document.querySelector(".stats-card:nth-child(3) h3").textContent = stats.completed
    document.querySelector(".stats-card:nth-child(4) h3").textContent = stats.new

    document.getElementById("totalCases").textContent = `${stats.total} Total`
  }

  // Utility functions
  function getStatusColor(status) {
    const colors = {
      new: "primary",
      "in-progress": "warning",
      completed: "success",
      "on-hold": "secondary",
      cancelled: "danger",
    }
    return colors[status] || "secondary"
  }

  function getPriorityColor(priority) {
    const colors = {
      high: "danger",
      medium: "warning",
      low: "success",
    }
    return colors[priority] || "secondary"
  }

  function getProgressColor(progress) {
    if (progress >= 80) return "success"
    if (progress >= 50) return "info"
    if (progress >= 25) return "warning"
    return "danger"
  }

  function formatStatus(status) {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Mobile navigation toggle
  window.toggleSidebar = () => {
    const sidebar = document.getElementById("sidebar")
    const overlay = document.getElementById("sidebarOverlay")

    sidebar.classList.toggle("show")
    overlay.classList.toggle("show")
  }

  // Close sidebar when clicking overlay
  document.getElementById("sidebarOverlay").addEventListener("click", () => {
    window.toggleSidebar()
  })

  // Global functions
  window.filterCases = () => {
    const statusFilter = document.getElementById("statusFilter").value
    const priorityFilter = document.getElementById("priorityFilter").value
    const typeFilter = document.getElementById("typeFilter").value
    const searchTerm = document.getElementById("searchInput").value.toLowerCase()

    filteredCases = casesData.filter((caseItem) => {
      const matchesStatus = !statusFilter || caseItem.status === statusFilter
      const matchesPriority = !priorityFilter || caseItem.priority === priorityFilter
      const matchesType = !typeFilter || caseItem.type === typeFilter
      const matchesSearch =
        !searchTerm ||
        caseItem.policyHolder.toLowerCase().includes(searchTerm) ||
        caseItem.id.toLowerCase().includes(searchTerm) ||
        caseItem.policyNumber.toLowerCase().includes(searchTerm)

      return matchesStatus && matchesPriority && matchesType && matchesSearch
    })

    currentPage = 1
    renderCases()
    renderPagination()
    updateStats()
  }

  window.searchCases = () => {
    window.filterCases()
  }

  window.sortCases = () => {
    const sortBy = document.getElementById("sortBy").value

    filteredCases.sort((a, b) => {
      switch (sortBy) {
        case "created-desc":
          return new Date(b.created) - new Date(a.created)
        case "created-asc":
          return new Date(a.created) - new Date(b.created)
        case "priority-desc":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case "status":
          return a.status.localeCompare(b.status)
        case "name":
          return a.policyHolder.localeCompare(b.policyHolder)
        default:
          return 0
      }
    })

    renderCases()
  }

  window.toggleView = (view) => {
    currentView = view
    const cardContainer = document.getElementById("cardViewContainer")
    const tableContainer = document.getElementById("tableViewContainer")

    if (view === "card") {
      cardContainer.style.display = "block"
      tableContainer.style.display = "none"
    } else {
      cardContainer.style.display = "none"
      tableContainer.style.display = "block"
    }

    renderCases()
  }

  window.changePage = (page) => {
    const totalPages = Math.ceil(filteredCases.length / casesPerPage)
    if (page >= 1 && page <= totalPages) {
      currentPage = page
      renderCases()
      renderPagination()

      // Scroll to top of cases section
      document.querySelector(".main-content").scrollTop = 0
    }
  }

  window.viewCaseDetails = (caseId) => {
    window.location.href = `case-details-enhanced.html?id=${caseId}`
  }

  window.editCase = (caseId) => {
    window.location.href = `case-creation.html?edit=${caseId}`
  }

  window.contactPolicyHolder = (caseId) => {
    const caseItem = casesData.find((c) => c.id === caseId)
    if (caseItem) {
      showAlert(`Initiating call to ${caseItem.policyHolder} (${caseItem.phone})`, "info")
    }
  }

  window.refreshCases = () => {
    showAlert("Cases refreshed successfully", "success")
    // In a real application, this would fetch fresh data from the server
    renderCases()
    updateStats()
  }

  window.exportCases = () => {
    showAlert("Exporting cases to CSV...", "info")
    // In a real application, this would generate and download a CSV file
    setTimeout(() => {
      showAlert("Cases exported successfully", "success")
    }, 2000)
  }

  function showAlert(message, type) {
    const alertDiv = document.createElement("div")
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`
    alertDiv.style.cssText = "top: 20px; right: 20px; z-index: 1050; min-width: 300px;"
    alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `

    document.body.appendChild(alertDiv)

    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove()
      }
    }, 5000)
  }

  // Handle window resize for responsive behavior
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      const sidebar = document.getElementById("sidebar")
      const overlay = document.getElementById("sidebarOverlay")
      sidebar.classList.remove("show")
      overlay.classList.remove("show")
    }
  })
})
