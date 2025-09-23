// Case Creation Form Functionality
document.addEventListener("DOMContentLoaded", () => {
  let currentStep = 1
  const totalSteps = 3

  const form = document.getElementById("caseCreationForm")
  const nextBtn = document.getElementById("nextBtn")
  const prevBtn = document.getElementById("prevBtn")
  const saveAsDraftBtn = document.getElementById("saveAsDraft")
  const progressBar = document.getElementById("progressBar")

  // Case type cards
  const caseTypeCards = document.querySelectorAll(".case-type-card")
  const dcOptions = document.getElementById("dcOptions")

  // Initialize form
  updateStepDisplay()
  setupEventListeners()

  function setupEventListeners() {
    // Navigation buttons
    nextBtn.addEventListener("click", handleNext)
    prevBtn.addEventListener("click", handlePrevious)
    saveAsDraftBtn.addEventListener("click", saveAsDraft)

    // Case type selection
    caseTypeCards.forEach((card) => {
      card.addEventListener("click", function () {
        const radioInput = this.querySelector('input[type="radio"]')
        radioInput.checked = true
        updateCaseTypeSelection()
      })
    })

    // Radio button changes
    document.querySelectorAll('input[name="caseType"]').forEach((radio) => {
      radio.addEventListener("change", updateCaseTypeSelection)
    })

    // Form field changes for summary
    document.getElementById("policyNumber").addEventListener("input", updateSummary)
    document.getElementById("holderName").addEventListener("input", updateSummary)
    document.getElementById("priority").addEventListener("change", updateSummary)
    document.getElementById("assignCoordinator").addEventListener("change", updateSummary)
    document.getElementById("expectedDate").addEventListener("change", updateSummary)

    // Form validation
    form.addEventListener("submit", handleSubmit)
  }

  function handleNext() {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        currentStep++
        updateStepDisplay()
        updateSummary()
      } else {
        // Submit form
        handleSubmit()
      }
    }
  }

  function handlePrevious() {
    if (currentStep > 1) {
      currentStep--
      updateStepDisplay()
    }
  }

  function updateStepDisplay() {
    // Hide all steps
    document.querySelectorAll(".step-content").forEach((step) => {
      step.classList.add("d-none")
    })

    // Show current step
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
    const progress = (currentStep / totalSteps) * 100
    progressBar.style.width = `${progress}%`

    // Update navigation buttons
    prevBtn.disabled = currentStep === 1
    nextBtn.textContent = currentStep === totalSteps ? "Create Case" : "Next"
    nextBtn.innerHTML =
      currentStep === totalSteps
        ? '<i class="fas fa-check me-2"></i>Create Case'
        : 'Next<i class="fas fa-arrow-right ms-2"></i>'

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step${currentStep}`)
    const requiredFields = currentStepElement.querySelectorAll("[required]")
    let isValid = true

    requiredFields.forEach((field) => {
      if (!field.checkValidity()) {
        field.classList.add("is-invalid")
        isValid = false
      } else {
        field.classList.remove("is-invalid")
        field.classList.add("is-valid")
      }
    })

    // Special validation for case type in step 2
    if (currentStep === 2) {
      const caseTypeSelected = document.querySelector('input[name="caseType"]:checked')
      if (!caseTypeSelected) {
        showAlert("Please select a case type (VMER or DC Visit)", "warning")
        isValid = false
      }
    }

    if (!isValid) {
      showAlert("Please fill in all required fields correctly", "danger")
    }

    return isValid
  }

  function updateCaseTypeSelection() {
    const selectedType = document.querySelector('input[name="caseType"]:checked')

    // Update card selection visual
    caseTypeCards.forEach((card) => {
      card.classList.remove("selected")
    })

    if (selectedType) {
      const selectedCard = selectedType.closest(".case-type-card")
      selectedCard.classList.add("selected")

      // Show/hide DC options
      if (selectedType.value === "dc") {
        dcOptions.classList.remove("d-none")
      } else {
        dcOptions.classList.add("d-none")
      }
    }
  }

  function updateSummary() {
    const summaryElements = {
      summaryPolicyNumber: document.getElementById("policyNumber").value || "-",
      summaryHolderName: document.getElementById("holderName").value || "-",
      summaryCaseType: getCaseTypeText(),
      summaryPriority: getPriorityText(),
      summaryCoordinator: getCoordinatorText(),
      summaryExpectedDate: document.getElementById("expectedDate").value || "-",
    }

    Object.entries(summaryElements).forEach(([id, value]) => {
      const element = document.getElementById(id)
      if (element) {
        element.textContent = value
      }
    })
  }

  function getCaseTypeText() {
    const selectedType = document.querySelector('input[name="caseType"]:checked')
    if (!selectedType) return "-"

    return selectedType.value === "vmer" ? "VMER (Video Medical Examination)" : "DC Visit (Diagnostic Center)"
  }

  function getPriorityText() {
    const priority = document.getElementById("priority").value
    const priorityMap = {
      normal: "Normal",
      high: "High Priority",
      urgent: "Urgent",
    }
    return priorityMap[priority] || "Normal"
  }

  function getCoordinatorText() {
    const coordinator = document.getElementById("assignCoordinator")
    return coordinator.options[coordinator.selectedIndex]?.text || "-"
  }

  function handleSubmit(e) {
    if (e) e.preventDefault()

    if (!validateCurrentStep()) return

    // Show loading state
    nextBtn.disabled = true
    nextBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creating Case...'

    // Collect form data
    const formData = collectFormData()

    // Simulate API call
    setTimeout(() => {
      // Reset button
      nextBtn.disabled = false
      updateStepDisplay()

      // Show success message and redirect
      showAlert("Case created successfully! Case ID: #LIC-2024-" + Math.floor(Math.random() * 1000), "success")

      setTimeout(() => {
        window.location.href = "case-details.html?id=LIC-2024-" + Math.floor(Math.random() * 1000)
      }, 2000)
    }, 3000)
  }

  function saveAsDraft() {
    const formData = collectFormData()

    // Show loading state
    saveAsDraftBtn.disabled = true
    saveAsDraftBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...'

    setTimeout(() => {
      saveAsDraftBtn.disabled = false
      saveAsDraftBtn.innerHTML = '<i class="fas fa-save me-2"></i>Save as Draft'

      showAlert("Case saved as draft successfully!", "info")
    }, 1500)
  }

  function collectFormData() {
    return {
      // Step 1 data
      policyNumber: document.getElementById("policyNumber").value,
      policyType: document.getElementById("policyType").value,
      holderName: document.getElementById("holderName").value,
      holderAge: document.getElementById("holderAge").value,
      holderPhone: document.getElementById("holderPhone").value,
      holderEmail: document.getElementById("holderEmail").value,
      holderAddress: document.getElementById("holderAddress").value,
      city: document.getElementById("city").value,
      state: document.getElementById("state").value,
      pincode: document.getElementById("pincode").value,

      // Step 2 data
      caseType: document.querySelector('input[name="caseType"]:checked')?.value,
      paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value,
      preferredDC: document.getElementById("preferredDC").value,
      priority: document.getElementById("priority").value,
      expectedDate: document.getElementById("expectedDate").value,
      caseNotes: document.getElementById("caseNotes").value,

      // Step 3 data
      assignCoordinator: document.getElementById("assignCoordinator").value,
      licAgent: document.getElementById("licAgent").value,
    }
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

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove()
      }
    }, 5000)
  }
})
