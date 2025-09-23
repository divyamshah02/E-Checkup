// Login Form Functionality
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  const togglePassword = document.getElementById("togglePassword")
  const passwordInput = document.getElementById("password")

  // Toggle password visibility
  togglePassword.addEventListener("click", function () {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
    passwordInput.setAttribute("type", type)

    const icon = this.querySelector("i")
    icon.classList.toggle("fa-eye")
    icon.classList.toggle("fa-eye-slash")
  })

  // Form submission
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const role = document.getElementById("role").value

    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]')
    const originalText = submitBtn.innerHTML
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Signing In...'
    submitBtn.disabled = true

    // Simulate API call
    setTimeout(() => {
      // Reset button
      submitBtn.innerHTML = originalText
      submitBtn.disabled = false

      // Redirect based on role
      redirectToDashboard(role)
    }, 2000)
  })

  function redirectToDashboard(role) {
    const dashboardUrls = {
      admin: "admin-dashboard.html",
      hod: "hod-dashboard.html",
      manager: "manager-dashboard.html",
      asst_manager: "asst-manager-dashboard.html",
      coordinator: "coordinator-dashboard.html",
      tele_caller: "tele-caller-dashboard.html",
      dc: "dc-dashboard.html",
      lic_ho: "lic-dashboard.html",
      lic_regional: "lic-dashboard.html",
      lic_divisional: "lic-dashboard.html",
      lic_branch: "lic-dashboard.html",
      lic_do: "lic-dashboard.html",
      lic_agent: "lic-dashboard.html",
    }

    window.location.href = dashboardUrls[role] || "dashboard.html"
  }

  // Form validation feedback
  const inputs = document.querySelectorAll("input, select")
  inputs.forEach((input) => {
    input.addEventListener("blur", function () {
      if (this.checkValidity()) {
        this.classList.remove("is-invalid")
        this.classList.add("is-valid")
      } else {
        this.classList.remove("is-valid")
        this.classList.add("is-invalid")
      }
    })
  })
})
