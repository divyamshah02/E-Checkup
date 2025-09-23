// User Management JavaScript for Coordinator (Limited to TeleCaller creation)
let currentUsers = []
let filteredUsers = []
let currentPage = 1
const usersPerPage = 10
let currentFilter = "all"
let endpoints = {}
let csrfToken = ""
let callApi // Declare callApi variable
let bootstrap // Declare bootstrap variable

// Initialize the user management page
async function InitializeUserManagement(token, apiEndpoints) {
  csrfToken = token
  endpoints = apiEndpoints

  callApi = window.callApi
  bootstrap = window.bootstrap

  setupEventListeners()
  await loadUsers()
}

function setupEventListeners() {
  // Search functionality
  document.getElementById("searchInput").addEventListener("input", () => {
    filterUsers()
  })

  // Filter dropdown
  document.querySelectorAll("[data-filter]").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault()
      currentFilter = this.dataset.filter
      filterUsers()
    })
  })

  // Create user button
  document.getElementById("createUserBtn").addEventListener("click", () => {
    createUser()
  })

  // Refresh button
  document.getElementById("refreshBtn").addEventListener("click", () => {
    loadUsers()
  })

  // Stats card filters
  document.querySelectorAll(".stats-card[data-role]").forEach((card) => {
    card.addEventListener("click", function () {
      const role = this.dataset.role
      currentFilter = role
      filterUsers()

      // Update active state
      document.querySelectorAll(".stats-card").forEach((c) => c.classList.remove("active"))
      this.classList.add("active")
    })
  })
}

async function loadUsers() {
  try {
    // Load users (coordinators can see telecallers and other coordinators)
    const [success, userData] = await callApi("GET", endpoints.users, null, csrfToken)

    if (success && userData.success) {
      // Filter to only show telecallers and coordinators for coordinator role
      currentUsers = (userData.data || []).filter((user) => user.role === "telecaller" || user.role === "coordinator")

      updateUserStats()
      filterUsers()
    } else {
      console.error("Failed to load users:", userData)
      showAlert("Failed to load users", "danger")
    }
  } catch (error) {
    console.error("Error loading users:", error)
    showAlert("Error loading users", "danger")
  }
}

function updateUserStats() {
  const stats = {
    total: currentUsers.length,
    coordinator: currentUsers.filter((u) => u.role === "coordinator").length,
    telecaller: currentUsers.filter((u) => u.role === "telecaller").length,
  }

  document.getElementById("total-users").textContent = stats.total
  document.getElementById("coordinator-count").textContent = stats.coordinator
  document.getElementById("telecaller-count").textContent = stats.telecaller
}

function filterUsers() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase()

  filteredUsers = currentUsers.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.user_id.toLowerCase().includes(searchTerm)

    const matchesFilter = currentFilter === "all" || user.role === currentFilter

    return matchesSearch && matchesFilter
  })

  currentPage = 1
  renderUsersTable()
  renderPagination()
}

function renderUsersTable() {
  const tbody = document.getElementById("users-table-body")
  const startIndex = (currentPage - 1) * usersPerPage
  const endIndex = startIndex + usersPerPage
  const pageUsers = filteredUsers.slice(startIndex, endIndex)

  tbody.innerHTML = pageUsers
    .map(
      (user) => `
        <tr>
            <td>
                <span class="fw-semibold">${user.user_id}</span>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="/placeholder.svg?height=32&width=32" alt="User" width="32" height="32" class="rounded-circle me-2">
                    <span class="fw-medium">${user.name}</span>
                </div>
            </td>
            <td>${user.email}</td>
            <td>
                <span class="badge ${getRoleBadgeClass(user.role)}">${formatRole(user.role)}</span>
            </td>
            <td>${user.contact_number || "N/A"}</td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <span class="badge ${user.is_active ? "bg-success" : "bg-danger"}">
                    ${user.is_active ? "Active" : "Inactive"}
                </span>
            </td>
            <td class="text-end">
                ${
                  user.role === "telecaller"
                    ? `
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editUser('${user.user_id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteUser('${user.user_id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                `
                    : `
                <span class="text-muted small">View Only</span>
                `
                }
            </td>
        </tr>
    `,
    )
    .join("")

  // Update pagination info
  document.getElementById("showing-start").textContent = startIndex + 1
  document.getElementById("showing-end").textContent = Math.min(endIndex, filteredUsers.length)
  document.getElementById("total-records").textContent = filteredUsers.length
}

function renderPagination() {
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const pagination = document.getElementById("pagination-controls")

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
      paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>'
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

function changePage(page) {
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  if (page >= 1 && page <= totalPages) {
    currentPage = page
    renderUsersTable()
    renderPagination()
  }
}

async function createUser() {
  const form = document.getElementById("createUserForm")

  // Basic validation
  const name = document.getElementById("userName").value.trim()
  const email = document.getElementById("userEmail").value.trim()
  const contact = document.getElementById("userContact").value.trim()
  const password = document.getElementById("userPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value

  if (!name || !email || !contact || !password) {
    showAlert("Please fill in all required fields", "warning")
    return
  }

  if (password !== confirmPassword) {
    showAlert("Passwords do not match", "warning")
    return
  }

  try {
    const payload = {
      name: name,
      email: email,
      contact_number: contact,
      role: "telecaller", // Coordinator can only create telecallers
      password: password,
    }

    const [success, result] = await callApi("POST", endpoints.users, payload, csrfToken)

    if (success && result.success) {
      showAlert("TeleCaller created successfully", "success")

      // Close modal and reset form
      const modal = bootstrap.Modal.getInstance(document.getElementById("createUserModal"))
      modal.hide()
      form.reset()

      // Reload users
      await loadUsers()
    } else {
      showAlert(`Failed to create user: ${result.error || "Unknown error"}`, "danger")
    }
  } catch (error) {
    console.error("Error creating user:", error)
    showAlert("Error creating user", "danger")
  }
}

function editUser(userId) {
  // TODO: Implement edit functionality
  showAlert("Edit functionality coming soon", "info")
}

function deleteUser(userId) {
  if (confirm("Are you sure you want to delete this user?")) {
    // TODO: Implement delete functionality
    showAlert("Delete functionality coming soon", "info")
  }
}

// Utility functions
function getRoleBadgeClass(role) {
  const classes = {
    coordinator: "bg-info",
    telecaller: "bg-warning",
  }
  return classes[role] || "bg-secondary"
}

function formatRole(role) {
  const roleNames = {
    coordinator: "Coordinator",
    telecaller: "TeleCaller",
  }
  return roleNames[role] || role
}

function formatDate(dateString) {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function showAlert(message, type) {
  // Create alert element
  const alertDiv = document.createElement("div")
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`
  alertDiv.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 300px;"
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `

  document.body.appendChild(alertDiv)

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove()
    }
  }, 5000)
}
