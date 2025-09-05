// User Management JavaScript for HOD
let currentUsers = []
let filteredUsers = []
let currentPage = 1
const usersPerPage = 10
let currentFilter = "all"
let endpoints = {}
let csrfToken = ""
let editingUserId = null // Track which user is being edited

// Initialize the user management page
async function InitializeUserManagement(token, apiEndpoints) {
  csrfToken = token
  endpoints = apiEndpoints

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

  // Role selection change in modal
  document.getElementById("userRole").addEventListener("change", function () {
    toggleRoleSpecificFields(this.value)
  })

  // Create user button
  document.getElementById("createUserBtn").addEventListener("click", () => {
    if (editingUserId) {
      updateUser()
    } else {
      createUser()
    }
  })

  // Refresh button
  // document.getElementById("refreshBtn").addEventListener("click", () => {
  //   loadUsers()
  // })

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
    const [success, userData] = await callApi("GET", endpoints.users, null, csrfToken)

    if (success && userData.success) {
      currentUsers = userData.data || []
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
  const roleMapping = {
    Coordinator: "coordinator",
    TeleCaller: "telecaller",
    DiagnosticCenter: "diagnostic_center",
    VmerMedCo: "vmer_med_co",
    LIC: "lic",
  }

  const stats = {
    total: currentUsers.length,
    coordinator: currentUsers.filter((u) => u.role === "Coordinator").length,
    telecaller: currentUsers.filter((u) => u.role === "TeleCaller").length,
    diagnostic_center: currentUsers.filter((u) => u.role === "DiagnosticCenter").length,
    vmer_med_co: currentUsers.filter((u) => u.role === "VmerMedCo").length,
    lic: currentUsers.filter((u) => u.role === "LIC").length,
  }

  document.getElementById("total-users").textContent = stats.total
  document.getElementById("coordinator-count").textContent = stats.coordinator
  document.getElementById("telecaller-count").textContent = stats.telecaller
  document.getElementById("dc-count").textContent = stats.diagnostic_center
  document.getElementById("vmer-count").textContent = stats.vmer_med_co
  document.getElementById("lic-count").textContent = stats.lic
}

function filterUsers() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase()

  const roleMapping = {
    coordinator: "Coordinator",
    telecaller: "TeleCaller",
    diagnostic_center: "DiagnosticCenter",
    vmer_med_co: "VmerMedCo",
    lic: "LIC",
  }

  filteredUsers = currentUsers.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.user_id.toLowerCase().includes(searchTerm)

    const matchesFilter = currentFilter === "all" || user.role === roleMapping[currentFilter]

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
                <span class="fw-medium text-nowrap">${user.name}</span>    
            </td>
            <td>${user.email}</td>
            <td>
                <span class="badge ${getRoleBadgeClass(user.role)}">${formatRole(user.role)}</span>
            </td>
            <td>${user.contact_number || "N/A"}</td>
            <td class="text-nowrap">${formatDate(user.created_at)}</td>
            <td>
                <span class="badge ${user.is_active ? "bg-success" : "bg-danger"}">
                    ${user.is_active ? "Active" : "Inactive"}
                </span>
            </td>
            <td class="text-end">
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editUser(${user.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-secondary" onclick="deleteUser(${user.id})" title="${user.is_active ? "Deactivate" : "Activate"}">
                        <i class="fas fa-${user.is_active ? "ban" : "check"}"></i>
                    </button>
                </div>
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

function toggleRoleSpecificFields(role) {
  const dcFields = document.getElementById("dcFields")
  const licFields = document.getElementById("licFields")

  // Hide all specific fields first
  dcFields.style.display = "none"
  licFields.style.display = "none"
  document.getElementById("userName-label").innerText = 'Full Name *'
  if (role === "DiagnosticCenter" || role === "diagnostic_center") {
    dcFields.style.display = "block"
    document.getElementById("userName-label").innerText = 'DC Name *'
  } else if (role === "LIC" || role === "lic") {
    licFields.style.display = "block"
  }
}

async function createUser() {
  const form = document.getElementById("createUserForm")

  // Basic validation
  const name = document.getElementById("userName").value.trim()
  const email = document.getElementById("userEmail").value.trim()
  const contact = document.getElementById("userContact").value.trim()
  const role = document.getElementById("userRole").value
  const password = document.getElementById("userPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value

  if (!name || !email || !contact || !role || !password) {
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
      role: role,
      password: password,
    }

    const [success, result] = await callApi("POST", endpoints.users, payload, csrfToken)

    if (success && result.success) {
      showAlert("User created successfully", "success")

      // Close modal and reset form
      const modal = bootstrap.Modal.getInstance(document.getElementById("createUserModal"))
      modal.hide()
      resetForm()

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
  console.log(userId)
  const user = currentUsers.find((u) => u.id === userId)
  if (!user) {
    showAlert("User not found", "danger")
    console.log('wFEJNIEwfjnipWFEJNIP')
    return
  }

  editingUserId = userId

  // Populate form with user data
  document.getElementById("userName").value = user.name
  document.getElementById("userEmail").value = user.email
  document.getElementById("userContact").value = user.contact_number || ""

  const roles = {
    Coordinator: "coordinator",
    TeleCaller: "telecaller",
    DiagnosticCenter: "diagnostic_center",
    VmerMedCo: "vmer_med_co",
    LIC: "lic",
    Admin: "admin",
    HOD: "hod",
  }

  document.getElementById("userRole").value = roles[user.role]

  // Hide password fields for editing
  document.getElementById("userPassword").parentElement.style.display = "none"
  document.getElementById("confirmPassword").parentElement.style.display = "none"

  // Update modal title and button
  document.querySelector("#createUserModal .modal-title").textContent = "Edit User"
  document.getElementById("createUserBtn").textContent = "Update User"
  document.getElementById("userRole").disabled = true;

  // Show role specific fields if needed
  toggleRoleSpecificFields(user.role)
  try {
    document.getElementById("dcContactPerson").value = user.dc_data.contact_person
    document.getElementById("dcAddress").value = user.dc_data.address
    document.getElementById("dcCity").value = user.dc_data.city
    document.getElementById("dcState").value = user.dc_data.state
    document.getElementById("dcPincode").value = user.dc_data.pincode
  } catch {}

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("createUserModal"))
  modal.show()
}

async function updateUser() {
  const form = document.getElementById("createUserForm")

  // Basic validation
  const name = document.getElementById("userName").value.trim()
  const email = document.getElementById("userEmail").value.trim()
  const contact = document.getElementById("userContact").value.trim()
  const role = document.getElementById("userRole").value
  const contact_person = document.getElementById("dcContactPerson").value
  const address = document.getElementById("dcAddress").value
  const city = document.getElementById("dcCity").value
  const state = document.getElementById("dcState").value
  const pincode = document.getElementById("dcPincode").value


  if (!name || !email || !contact || !role) {
    showAlert("Please fill in all required fields", "warning")
    return
  }

  try {
    const payload = {
      name: name,
      email: email,
      contact_number: contact,
      role: role,
      contact_person: contact_person,
      address: address,
      city: city,
      state: state,
      pincode: pincode,
    }

    const [success, result] = await callApi("PUT", `${endpoints.users}${editingUserId}/`, payload, csrfToken)

    if (success && result.success) {
      showAlert("User updated successfully", "success")

      // Close modal and reset form
      const modal = bootstrap.Modal.getInstance(document.getElementById("createUserModal"))
      modal.hide()
      resetForm()

      // Reload users
      await loadUsers()
    } else {
      showAlert(`Failed to update user: ${result.error || "Unknown error"}`, "danger")
    }
  } catch (error) {
    console.error("Error updating user:", error)
    showAlert("Error updating user", "danger")
  }
}

async function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
    return
  }

  try {
    const [success, result] = await callApi("DELETE", `${endpoints.users}${userId}/`, null, csrfToken)

    if (success && result.success) {
      showAlert("User deleted successfully", "success")
      await loadUsers()
    } else {
      showAlert(`Failed to delete user: ${result.error || "Unknown error"}`, "danger")
    }
  } catch (error) {
    console.error("Error deleting user:", error)
    showAlert("Error deleting user", "danger")
  }
}

async function toggleUserStatus(userId) {
  const user = currentUsers.find((u) => u.id === userId)
  if (!user) {
    showAlert("User not found", "danger")
    return
  }

  const action = user.is_active ? "deactivate" : "activate"
  if (!confirm(`Are you sure you want to ${action} this user?`)) {
    return
  }

  try {
    const payload = { is_active: !user.is_active }
    const [success, result] = await callApi("PATCH", `${endpoints.users}${userId}/`, payload, csrfToken)

    if (success && result.success) {
      showAlert(`User ${action}d successfully`, "success")
      await loadUsers()
    } else {
      showAlert(`Failed to ${action} user: ${result.error || "Unknown error"}`, "danger")
    }
  } catch (error) {
    console.error(`Error ${action}ing user:`, error)
    showAlert(`Error ${action}ing user`, "danger")
  }
}

function resetForm() {
  const form = document.getElementById("createUserForm")
  form.reset()
  editingUserId = null

  // Reset modal title and button
  document.querySelector("#createUserModal .modal-title").textContent = "Create New User"
  document.getElementById("createUserBtn").textContent = "Create User"
  document.getElementById("userRole").disabled = false;

  // Show password fields
  document.getElementById("userPassword").parentElement.style.display = "block"
  document.getElementById("confirmPassword").parentElement.style.display = "block"

  // Hide role specific fields
  toggleRoleSpecificFields("")
}

// Add event listener to reset form when modal is hidden
document.getElementById("createUserModal").addEventListener("hidden.bs.modal", resetForm)

// Utility functions
function getRoleBadgeClass(role) {
  const classes = {
    Coordinator: "bg-info",
    TeleCaller: "bg-warning",
    DiagnosticCenter: "bg-success",
    VmerMedCo: "bg-primary",
    LIC: "bg-danger",
    Admin: "bg-secondary",
    HOD: "bg-primary",
  }
  return classes[role] || "bg-secondary"
}

function formatRole(role) {
  const roleNames = {
    Coordinator: "Coordinator",
    TeleCaller: "TeleCaller",
    DiagnosticCenter: "DC Center",
    VmerMedCo: "VMER Med Co",
    LIC: "LIC User",
    Admin: "Admin",
    HOD: "HOD",
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
