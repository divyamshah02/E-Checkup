document.addEventListener("DOMContentLoaded", () => {
  let currentStep = 1
  const totalSteps = 3

  const form = document.getElementById("caseCreationForm")
  const nextBtn = document.getElementById("nextBtn")
  const prevBtn = document.getElementById("prevBtn")
  const progressBar = document.getElementById("progressBar")

  const policyTypeSelect = document.getElementById("policyType")
  const policyNumberLabel = document.getElementById("policyNumberLabel")
  const summaryPolicyNumberLabel = document.getElementById("summaryPolicyNumberLabel")

  const regionalOfficeSelect = document.getElementById("regionalOffice")
  const divisionalOfficeSelect = document.getElementById("divisionalOffice")
  const branchOfficeSelect = document.getElementById("branchOffice")
  const licUserSelect = document.getElementById("licUser")

  const officeData = {
    "Western Zone": {
      Mumbai: { "Branch 01": ["User A (Mumbai 01)", "User B (Mumbai 01)"], "Branch 02": ["User C (Mumbai 02)"] },
      Pune: { "Branch 03": ["User D (Pune 03)"] },
    },
    "Northern Zone": { Delhi: { "Branch 04": ["User E (Delhi 04)"] } },
  }

  function updateStepDisplay() {
    document.querySelectorAll(".step-content").forEach((step) => step.classList.add("d-none"))
    document.getElementById(`step${currentStep}`).classList.remove("d-none")

    document.querySelectorAll(".step-indicator").forEach((indicator, index) => {
      indicator.classList.remove("active", "completed")
      if (index + 1 < currentStep) indicator.classList.add("completed")
      else if (index + 1 === currentStep) indicator.classList.add("active")
    })

    progressBar.style.width = `${(currentStep / totalSteps) * 100}%`
    prevBtn.disabled = currentStep === 1
    nextBtn.innerHTML =
      currentStep === totalSteps
        ? '<i class="fas fa-check me-2"></i>Create Case'
        : 'Next<i class="fas fa-arrow-right ms-2"></i>'
  }

  function clearValidationErrors() {
    // Clear all is-invalid classes
    document.querySelectorAll(".is-invalid").forEach((field) => {
      field.classList.remove("is-invalid")
    })

    // Hide case type error
    document.getElementById("caseTypeError").classList.remove("show")

    // Remove was-validated class from form
    form.classList.remove("was-validated")
  }

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

    // Special validation for case type radio buttons in step 1
    if (currentStep === 1) {
      const caseTypeSelected = document.querySelector('input[name="caseType"]:checked')
      if (!caseTypeSelected) {
        document.getElementById("caseTypeError").classList.add("show")
        isValid = false
      }

      // Special handling for DC Visit fields
      const selectedCaseType = caseTypeSelected?.value
      if (selectedCaseType === "dc-visit") {
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

  function updateSummary() {
    const selectedCaseType = document.querySelector('input[name="caseType"]:checked')
    document.getElementById("summaryCaseType").textContent = selectedCaseType
      ? selectedCaseType.value.toUpperCase()
      : "-"

    const policyType = policyTypeSelect.value
    document.getElementById("summaryPolicyType").textContent = policyType || "-"
    summaryPolicyNumberLabel.textContent = policyType === "new" ? "Proposal Number:" : "Policy Number:"
    document.getElementById("summaryPolicyNumber").textContent = document.getElementById("policyNumber").value || "-"
    document.getElementById("summaryHolderName").textContent = document.getElementById("holderName").value || "-"
    document.getElementById("summaryHolderPhone").textContent = document.getElementById("holderPhone").value || "-"
    document.getElementById("summarySumAssured").textContent = document.getElementById("sumAssured").value
      ? `₹${document.getElementById("sumAssured").value}`
      : "-"

    const licUser = licUserSelect.options[licUserSelect.selectedIndex]
    document.getElementById("summaryLicUser").textContent = licUser && licUser.value ? licUser.text : "-"

    const coordinator = document.getElementById("assignCoordinator")
    document.getElementById("summaryCoordinator").textContent =
      coordinator.options[coordinator.selectedIndex]?.text || "-"

    document.getElementById("summaryPriority").textContent = document.getElementById("priority").value || "Normal"
    document.getElementById("summaryDueDate").textContent = document.getElementById("dueDate").value || "-"
  }

  function populateDropdown(selectElement, items) {
    selectElement.innerHTML = '<option value="">Select...</option>'
    items.forEach((item) => {
      const option = new Option(item, item)
      selectElement.add(option)
    })
  }

  // Real-time validation clearing
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

  nextBtn.addEventListener("click", () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        currentStep++
        updateStepDisplay()
        if (currentStep === totalSteps) {
          updateSummary()
        }
      } else {
        // Final submit logic
        alert("Case created successfully!")
        // window.location.href = 'dashboard.html';
      }
    }
  })

  prevBtn.addEventListener("click", () => {
    if (currentStep > 1) {
      currentStep--
      updateStepDisplay()
      clearValidationErrors() // Clear validation when going back
    }
  })

  policyTypeSelect.addEventListener("change", (e) => {
    const label = e.target.value === "new" ? "Proposal Number" : "Policy Number"
    policyNumberLabel.innerHTML = `${label} <span class="text-danger">*</span>`
  })

  document.querySelectorAll(".case-type-card").forEach((card) => {
    card.addEventListener("click", function () {
      const radio = this.querySelector('input[type="radio"]')
      radio.checked = true

      // Clear validation error when selecting
      document.getElementById("caseTypeError").classList.remove("show")

      document.querySelectorAll(".case-type-card").forEach((c) => c.classList.remove("selected"))
      this.classList.add("selected")

      // Show/hide DC Visit fields
      const dcVisitFields = document.getElementById("dcVisitFields")
      const paymentMethod = document.getElementById("paymentMethod")

      if (radio.value === "dc-visit") {
        dcVisitFields.classList.remove("d-none")
        paymentMethod.setAttribute("required", "required")
      } else {
        dcVisitFields.classList.add("d-none")
        paymentMethod.removeAttribute("required")
        paymentMethod.classList.remove("is-invalid")
      }
    })
  })

  regionalOfficeSelect.addEventListener("change", () => {
    const selectedRegion = regionalOfficeSelect.value
    divisionalOfficeSelect.innerHTML = '<option value="">Select...</option>'
    branchOfficeSelect.innerHTML = '<option value="">Select...</option>'
    licUserSelect.innerHTML = '<option value="">Select...</option>'

    // Clear validation states
    divisionalOfficeSelect.classList.remove("is-invalid")
    branchOfficeSelect.classList.remove("is-invalid")
    licUserSelect.classList.remove("is-invalid")

    divisionalOfficeSelect.disabled = true
    branchOfficeSelect.disabled = true
    licUserSelect.disabled = true

    if (selectedRegion) {
      populateDropdown(divisionalOfficeSelect, Object.keys(officeData[selectedRegion]))
      divisionalOfficeSelect.disabled = false
    }
  })

  divisionalOfficeSelect.addEventListener("change", () => {
    const selectedRegion = regionalOfficeSelect.value
    const selectedDivision = divisionalOfficeSelect.value
    branchOfficeSelect.innerHTML = '<option value="">Select...</option>'
    licUserSelect.innerHTML = '<option value="">Select...</option>'

    // Clear validation states
    branchOfficeSelect.classList.remove("is-invalid")
    licUserSelect.classList.remove("is-invalid")

    branchOfficeSelect.disabled = true
    licUserSelect.disabled = true

    if (selectedDivision) {
      populateDropdown(branchOfficeSelect, Object.keys(officeData[selectedRegion][selectedDivision]))
      branchOfficeSelect.disabled = false
    }
  })

  branchOfficeSelect.addEventListener("change", () => {
    const selectedRegion = regionalOfficeSelect.value
    const selectedDivision = divisionalOfficeSelect.value
    const selectedBranch = branchOfficeSelect.value
    licUserSelect.innerHTML = '<option value="">Select...</option>'

    // Clear validation state
    licUserSelect.classList.remove("is-invalid")

    licUserSelect.disabled = true

    if (selectedBranch) {
      populateDropdown(licUserSelect, officeData[selectedRegion][selectedDivision][selectedBranch])
      licUserSelect.disabled = false
    }
  })

  // Initial setup
  populateDropdown(regionalOfficeSelect, Object.keys(officeData))
  updateStepDisplay()
  setupRealTimeValidation()
})
