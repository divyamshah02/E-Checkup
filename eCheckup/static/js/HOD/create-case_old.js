// API Configuration
const API_BASE_URL = "http://127.0.0.1:8000"
const CASE_API_URL = `${API_BASE_URL}/case-api`
const USER_API_URL = `${API_BASE_URL}/user-api`

// Global variables
let currentStep = 1
const totalSteps = 3
let csrfToken = ""
let currentUser = null

// DOM Elements
const form = document.getElementById("caseCreationForm")
const nextBtn = document.getElementById("nextBtn")
const prevBtn = document.getElementById("prevBtn")
const progressBar = document.getElementById("progressBar")
const loadingOverlay = document.getElementById("loadingOverlay")
const alertContainer = document.getElementById("alertContainer")

// Bootstrap Alert
const bootstrap = window.bootstrap

// Initialize the application
document.addEventListener("DOMContentLoaded", async () => {
  await initializeApp()
  setupEventListeners()
  updateStepDisplay()
  setupRealTimeValidation()
  setDefaultDueDate()
})

// Initialize application
async function initializeApp() {
  try {
    showLoading(true)

    // Get CSRF token
    await getCsrfToken()

    // Get current user details
    await getCurrentUser()

    // Load coordinators
    await loadCoordinators()
  } catch (error) {
    console.error("Initialization error:", error)
    showAlert("Failed to initialize application. Please refresh the page.", "danger")
  } finally {
    showLoading(false)
  }
}

// Get CSRF token
async function getCsrfToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/get-csrf-token/`, {
      credentials: "include",
    })
    const data = await response.json()
    csrfToken = data.csrfToken
  } catch (error) {
    console.error("Failed to get CSRF token:", error)
  }
}

// Get current user details
async function getCurrentUser() {
  try {
    const response = await fetch(`${USER_API_URL}/user-detail-api/`, {
      credentials: "include",
      headers: {
        "X-CSRFToken": csrfToken,
      },
    })

    if (response.ok) {
      const result = await response.json()
      currentUser = result.data
      updateUserDisplay()
    } else {
      // Redirect to login if not authenticated
      window.location.href = "login.html"
    }
  } catch (error) {
    console.error("Failed to get user details:", error)
    window.location.href = "login.html"
  }
}

// Update user display in header
function updateUserDisplay() {
  if (currentUser) {
    document.getElementById("userDisplayName").textContent = currentUser.name
    document.getElementById("userRole").textContent = currentUser.role.replace("_", " ").toUpperCase()
  }
}

// Load coordinators from API
async function loadCoordinators() {
  try {
    const response = await fetch(`${CASE_API_URL}/staff-list-api/?role=coordinator`, {
      credentials: "include",
      headers: {
        "X-CSRFToken": csrfToken,
      },
    })

    if (response.ok) {
      const result = await response.json()
      const coordinators = result.data

      const coordinatorSelect = document.getElementById("assignCoordinator")
      coordinatorSelect.innerHTML = '<option value="">Select coordinator</option>'

      coordinators.forEach((coordinator) => {
        const option = document.createElement("option")
        option.value = coordinator.user_id
        option.textContent = coordinator.name
        coordinatorSelect.appendChild(option)
      })
    }
  } catch (error) {
    console.error("Failed to load coordinators:", error)
    showAlert("Failed to load coordinators. Please refresh the page.", "danger")
  }
}

// Setup event listeners
function setupEventListeners() {
  nextBtn.addEventListener("click", handleNext)
  prevBtn.addEventListener("click", handlePrevious)

  // Case type selection
  document.querySelectorAll(".case-type-card").forEach((card) => {
    card.addEventListener("click", handleCaseTypeSelection)
  })

  // Policy type change
  document.getElementById("policyType").addEventListener("change", handlePolicyTypeChange)

  // Mobile sidebar toggle
  const sidebarToggle = document.getElementById("sidebarToggle")
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      document.getElementById("sidebar").classList.toggle("show")
    })
  }
}

// Handle next button click
async function handleNext() {
  if (validateCurrentStep()) {
    if (currentStep < totalSteps) {
      currentStep++
      updateStepDisplay()
      if (currentStep === totalSteps) {
        updateSummary()
      }
    } else {
      // Submit the form
      await submitCase()
    }
  }
}

// Handle previous button click
function handlePrevious() {
  if (currentStep > 1) {
    currentStep--
    updateStepDisplay()
    clearValidationErrors()
  }
}

// Handle case type selection
function handleCaseTypeSelection() {
  const radio = this.querySelector('input[type="radio"]')
  radio.checked = true

  // Clear validation error
  document.getElementById("caseTypeError").classList.remove("show")

  // Update card selection
  document.querySelectorAll(".case-type-card").forEach((c) => c.classList.remove("selected"))
  this.classList.add("selected")

  // Show/hide DC Visit fields
  const dcVisitFields = document.getElementById("dcVisitFields")
  const paymentMethod = document.getElementById("paymentMethod")

  if (radio.value === "dc_visit") {
    dcVisitFields.classList.remove("d-none")
    paymentMethod.setAttribute("required", "required")
  } else {
    dcVisitFields.classList.add("d-none")
    paymentMethod.removeAttribute("required")
    paymentMethod.classList.remove("is-invalid")
  }
}

// Handle policy type change
function handlePolicyTypeChange(e) {
  const label = e.target.value === "new" ? "Proposal Number" : "Policy Number"
  document.getElementById("policyNumberLabel").innerHTML = `${label} <span class="text-danger">*</span>`
}

// Update step display
function updateStepDisplay() {
  // Hide all steps
  document.querySelectorAll(".step-content").forEach((step) => step.classList.add("d-none"))
  document.getElementById(`step${currentStep}`).classList.remove("d-none")

  // Update step indicators
  document.querySelectorAll(".step-indicator").forEach((indicator, index) => {
    indicator.classList.remove("active", "completed")
    if (index + 1 < currentStep) {
      indicator.classList.add("completed")
    } else if (index + 1 === currentStep) {
      indicator.classList.add("active")
    }
  })

  // Update progress bar
  progressBar.style.width = `${(currentStep / totalSteps) * 100}%`

  // Update buttons
  prevBtn.disabled = currentStep === 1
  nextBtn.innerHTML =
    currentStep === totalSteps
      ? '<i class="fas fa-check me-2"></i>Create Case'
      : 'Next<i class="fas fa-arrow-right ms-2"></i>'
}

// Validate current step
function validateCurrentStep() {
  const currentStepElement = document.getElementById(`step${currentStep}`)
  const requiredFields = currentStepElement.querySelectorAll("[required]")
  let isValid = true

  // Clear previous validation errors
  clearValidationErrors()

  // Validate required fields
  requiredFields.forEach((field) => {
    if (!field.checkValidity() || (field.type !== "radio" && field.value.trim() === "")) {
      field.classList.add("is-invalid")
      isValid = false
    }
  })

  // Special validation for case type in step 1
  if (currentStep === 1) {
    const caseTypeSelected = document.querySelector('input[name="caseType"]:checked')
    if (!caseTypeSelected) {
      document.getElementById("caseTypeError").classList.add("show")
      isValid = false
    }

    // Validate DC Visit fields if selected
    const selectedCaseType = caseTypeSelected?.value
    if (selectedCaseType === "dc_visit") {
      const paymentMethod = document.getElementById("paymentMethod")
      if (!paymentMethod.value) {
        paymentMethod.classList.add("is-invalid")
        isValid = false
      }
    }
  }

  // Validate email format if provided
  const emailField = document.getElementById("holderEmail")
  if (emailField && emailField.value && !emailField.checkValidity()) {
    emailField.classList.add("is-invalid")
    isValid = false
  }

  return isValid
}

// Clear validation errors
function clearValidationErrors() {
  document.querySelectorAll(".is-invalid").forEach((field) => {
    field.classList.remove("is-invalid")
  })
  document.getElementById("caseTypeError").classList.remove("show")
  form.classList.remove("was-validated")
}

// Setup real-time validation
function setupRealTimeValidation() {
  const allInputs = document.querySelectorAll("input, select, textarea")
  allInputs.forEach((input) => {
    input.addEventListener("input", function () {
      if (this.classList.contains("is-invalid")) {
        if (this.checkValidity() && this.value.trim() !== "") {
          this.classList.remove("is-invalid")
        }
      }
    })

    input.addEventListener("change", function () {
      if (this.classList.contains("is-invalid")) {
        if (this.checkValidity() && this.value.trim() !== "") {
          this.classList.remove("is-invalid")
        }
      }
    })
  })

  // Special handling for case type radio buttons
  document.querySelectorAll('input[name="caseType"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.checked) {
        document.getElementById("caseTypeError").classList.remove("show")
      }
    })
  })
}

// Update summary in step 3
function updateSummary() {
  const selectedCaseType = document.querySelector('input[name="caseType"]:checked')
  document.getElementById("summaryCaseType").textContent = selectedCaseType
    ? selectedCaseType.value.toUpperCase().replace("_", " ")
    : "-"

  const policyType = document.getElementById("policyType").value
  document.getElementById("summaryPolicyType").textContent = policyType || "-"

  const policyNumberLabel = policyType === "new" ? "Proposal Number:" : "Policy Number:"
  document.getElementById("summaryPolicyNumberLabel").textContent = policyNumberLabel
  document.getElementById("summaryPolicyNumber").textContent = document.getElementById("policyNumber").value || "-"

  document.getElementById("summaryHolderName").textContent = document.getElementById("holderName").value || "-"
  document.getElementById("summaryHolderPhone").textContent = document.getElementById("holderPhone").value || "-"
  document.getElementById("summarySumAssured").textContent = document.getElementById("sumAssured").value
    ? `₹${document.getElementById("sumAssured").value}`
    : "-"

  document.getElementById("summaryLicOffice").textContent = document.getElementById("licOfficeCode").value || "-"

  const coordinator = document.getElementById("assignCoordinator")
  document.getElementById("summaryCoordinator").textContent =
    coordinator.options[coordinator.selectedIndex]?.text || "-"

  document.getElementById("summaryPriority").textContent = document.getElementById("priority").value || "Normal"
  document.getElementById("summaryDueDate").textContent = document.getElementById("dueDate").value || "-"
}

// Submit case to API
async function submitCase() {
  try {
    showLoading(true)

    const formData = collectFormData()

    const response = await fetch(`${CASE_API_URL}/case-api/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(formData),
    })

    const result = await response.json()

    if (response.ok && result.success) {
      showAlert(`Case created successfully! Case ID: ${result.data.case_id}`, "success")
      setTimeout(() => {
        window.location.href = "dashboard.html"
      }, 2000)
    } else {
      const errorMessage = result.error || "Failed to create case"
      showAlert(errorMessage, "danger")
    }
  } catch (error) {
    console.error("Submit error:", error)
    showAlert("An error occurred while creating the case. Please try again.", "danger")
  } finally {
    showLoading(false)
  }
}

// Collect form data
function collectFormData() {
  const selectedCaseType = document.querySelector('input[name="caseType"]:checked')

  const formData = {
    case_type: selectedCaseType.value,
    policy_type: document.getElementById("policyType").value,
    policy_number: document.getElementById("policyNumber").value,
    sum_assured: document.getElementById("sumAssured").value,
    priority: document.getElementById("priority").value,
    due_date: document.getElementById("dueDate").value,
    holder_name: document.getElementById("holderName").value,
    holder_phone: document.getElementById("holderPhone").value,
    holder_email: document.getElementById("holderEmail").value || null,
    lic_office_code: document.getElementById("licOfficeCode").value,
    assigned_coordinator_id: document.getElementById("assignCoordinator").value,
  }

  // Add payment method for DC visits
  if (selectedCaseType.value === "dc_visit") {
    formData.payment_method = document.getElementById("paymentMethod").value
  }

  return formData
}

// Set default due date (7 days from today)
function setDefaultDueDate() {
  const today = new Date()
  const defaultDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const formattedDate = defaultDate.toISOString().split("T")[0]
  document.getElementById("dueDate").value = formattedDate
}

// Show/hide loading overlay
function showLoading(show) {
  loadingOverlay.style.display = show ? "flex" : "none"
}

// Show alert message
function showAlert(message, type = "info") {
  const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="fas fa-${type === "success" ? "check-circle" : type === "danger" ? "exclamation-circle" : "info-circle"} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `
  alertContainer.innerHTML = alertHtml

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    const alert = alertContainer.querySelector(".alert")
    if (alert) {
      const bsAlert = new bootstrap.Alert(alert)
      bsAlert.close()
    }
  }, 5000)
}

// Handle logout
async function handleLogout() {
  try {
    await fetch(`${USER_API_URL}/logout-api/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": csrfToken,
      },
      credentials: "include",
    })
  } catch (error) {
    console.error("Logout error:", error)
  } finally {
    window.location.href = "login.html"
  }
}
