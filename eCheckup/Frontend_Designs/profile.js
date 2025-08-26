// Profile Management Functionality
document.addEventListener("DOMContentLoaded", () => {
  // Simulate loading user profile
  loadUserProfile()

  // Setup event listeners
  setupEventListeners()

  function loadUserProfile() {
    // Simulate API call
    setTimeout(() => {
      // Mock user data
      const userData = {
        name: "John Manager",
        email: "john.manager@example.com",
        phone: "+91 9876543210",
        role: "Manager",
        department: "Case Management",
        location: "Mumbai",
      }

      // Populate profile fields
      document.getElementById("name").value = userData.name
      document.getElementById("email").value = userData.email
      document.getElementById("phone").value = userData.phone
      document.getElementById("role").value = userData.role
      document.getElementById("department").value = userData.department
      document.getElementById("location").value = userData.location

      window.showNotification("Profile loaded successfully!", "success")
    }, 1000)
  }

  function setupEventListeners() {
    // Update profile button
    const updateProfileBtn = document.getElementById("updateProfileBtn")
    if (updateProfileBtn) {
      updateProfileBtn.addEventListener("click", updateProfile)
    }

    // Change password button
    const changePasswordBtn = document.getElementById("changePasswordBtn")
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener("click", showChangePasswordModal)
    }

    // Delete account button
    const deleteAccountBtn = document.getElementById("deleteAccountBtn")
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener("click", showDeleteAccountModal)
    }
  }

  function updateProfile() {
    // Validate form
    const form = document.getElementById("profileForm")
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    // Show loading state
    const updateProfileBtn = document.getElementById("updateProfileBtn")
    const originalText = updateProfileBtn.innerHTML
    updateProfileBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Updating...'
    updateProfileBtn.disabled = true

    // Simulate API call
    setTimeout(() => {
      // Reset button
      updateProfileBtn.innerHTML = originalText
      updateProfileBtn.disabled = false

      // Show success message
      window.showNotification("Profile updated successfully!", "success")
    }, 2000)
  }

  function showChangePasswordModal() {
    const modalHtml = `
      <div class="modal fade" id="changePasswordModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Change Password</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="changePasswordForm">
                <div class="mb-3">
                  <label for="currentPassword" class="form-label">Current Password</label>
                  <input type="password" class="form-control" id="currentPassword" required>
                </div>
                <div class="mb-3">
                  <label for="newPassword" class="form-label">New Password</label>
                  <input type="password" class="form-control" id="newPassword" required>
                </div>
                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirm New Password</label>
                  <input type="password" class="form-control" id="confirmPassword" required>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" onclick="changePassword()">Change Password</button>
            </div>
          </div>
        </div>
      </div>
    `

    document.body.insertAdjacentHTML("beforeend", modalHtml)
    const modal = new window.bootstrap.Modal(document.getElementById("changePasswordModal"))
    modal.show()
  }

  function showDeleteAccountModal() {
    const modalHtml = `
      <div class="modal fade" id="deleteAccountModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">Delete Account</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete your account? This action cannot be undone.</p>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="confirmDelete" required>
                <label class="form-check-label" for="confirmDelete">
                  I confirm that I want to permanently delete my account.
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-danger" onclick="deleteAccount()">Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    `

    document.body.insertAdjacentHTML("beforeend", modalHtml)
    const modal = new window.bootstrap.Modal(document.getElementById("deleteAccountModal"))
    modal.show()
  }

  window.changePassword = () => {
    const form = document.getElementById("changePasswordForm")
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    // Get form values
    const currentPassword = document.getElementById("currentPassword").value
    const newPassword = document.getElementById("newPassword").value
    const confirmPassword = document.getElementById("confirmPassword").value

    // Validate new password
    if (newPassword !== confirmPassword) {
      window.showNotification("New passwords do not match", "warning")
      return
    }

    // Show loading state
    const changePasswordBtn = document.querySelector("#changePasswordModal .btn-primary")
    const originalText = changePasswordBtn.innerHTML
    changePasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Changing Password...'
    changePasswordBtn.disabled = true

    // Simulate API call
    setTimeout(() => {
      // Reset button
      changePasswordBtn.innerHTML = originalText
      changePasswordBtn.disabled = false

      // Close modal
      const modal = window.bootstrap.Modal.getInstance(document.getElementById("changePasswordModal"))
      modal.hide()

      // Show success message
      window.showNotification("Password changed successfully!", "success")
    }, 2000)
  }

  window.deleteAccount = () => {
    const confirmDelete = document.getElementById("confirmDelete")
    if (!confirmDelete.checked) {
      window.showNotification("Please confirm that you want to delete your account", "warning")
      return
    }

    // Show loading state
    const deleteAccountBtn = document.querySelector("#deleteAccountModal .btn-danger")
    const originalText = deleteAccountBtn.innerHTML
    deleteAccountBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Deleting Account...'
    deleteAccountBtn.disabled = true

    // Simulate API call
    setTimeout(() => {
      // Reset button
      deleteAccountBtn.innerHTML = originalText
      deleteAccountBtn.disabled = false

      // Close modal
      const modal = window.bootstrap.Modal.getInstance(document.getElementById("deleteAccountModal"))
      modal.hide()

      // Show success message
      window.showNotification("Account deleted successfully!", "success")

      // Redirect to login page
      window.location.href = "login.html"
    }, 3000)
  }
})

// Declare showNotification function
window.showNotification = (message, type) => {
  const notification = document.createElement("div")
  notification.className = `alert alert-${type} alert-dismissible fade show`
  notification.role = "alert"
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `

  document.body.appendChild(notification)
}
