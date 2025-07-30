
let currentStep = 1
const totalSteps = 3

let csrf_token = ""
let case_api_url = ""
let user_api_url = ""

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
    Mumbai: { "Branch 01": ["User A", "User B"], "Branch 02": ["User C"] },
    Pune: { "Branch 03": ["User D"] },
  },
  "Northern Zone": { Delhi: { "Branch 04": ["User E"] } },
}


async function InitializeCreateCase(csrf_token_param, case_api_url_param, user_api_url_param) {
  csrf_token = csrf_token_param
  case_api_url = case_api_url_param
  user_api_url = user_api_url_param
  

  populateDropdown(regionalOfficeSelect, Object.keys(officeData))
  updateStepDisplay()
  setupRealTimeValidation()
  await loadCoordinators()

}

function updateStepDisplay() {
  document.querySelectorAll(".step-content").forEach((step) => step.classList.add("d-none"))
  document.getElementById(`step${currentStep}`).classList.remove("d-none")

  document.querySelectorAll(".step-indicator").forEach((indicator, index) => {
    indicator.classList.remove("active", "completed")
    // if (index + 1 < currentStep) {indicator.classList.add("completed"); console.log(indicator.firstElementChild)}
    if (index + 1 < currentStep) {indicator.classList.add("completed")}
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

async function loadCoordinators() {
  try {
    const full_url = `${user_api_url}?role=coordinator`
    const [success, result] = await callApi("GET", full_url)
    if (success && result.success) {
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
    alert("Failed to load coordinators. Please refresh the page.")
  }

  
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

nextBtn.addEventListener("click", async () => {
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

    // if (radio.value === "dc-visit") {
    //   dcVisitFields.classList.remove("d-none")
    //   paymentMethod.setAttribute("required", "required")
    // } else {
    //   dcVisitFields.classList.add("d-none")
    //   paymentMethod.removeAttribute("required")
    //   paymentMethod.classList.remove("is-invalid")
    // }
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


policyTypeSelect.addEventListener("change", function () {
    const selectedValue = this.value;

    if (selectedValue === "new") {
        policyNumberLabel.innerHTML = 'Proposal Number <span class="text-danger">*</span>';
    } else {
        policyNumberLabel.innerHTML = 'Policy Number <span class="text-danger">*</span>';
    }
});

function collectFormData() {
  const selectedCaseType = document.querySelector('input[name="caseType"]:checked')
  let case_type = selectedCaseType.value
  if (selectedCaseType.value == 'dc-visit') {
    case_type = 'dc_visit'
  }
  const formData = {
    case_type: case_type,
    policy_type: document.getElementById("policyType").value,
    policy_number: document.getElementById("policyNumber").value,
    sum_assured: document.getElementById("sumAssured").value,
    priority: document.getElementById("priority").value,
    due_date: document.getElementById("dueDate").value,
    holder_name: document.getElementById("holderName").value,
    holder_phone: document.getElementById("holderPhone").value,
    holder_email: document.getElementById("holderEmail").value || null,
    lic_office_code: document.getElementById("licUser").value,
    assigned_coordinator_id: document.getElementById("assignCoordinator").value,
    payment_method: document.getElementById("paymentMethod").value
  }

  return formData
}

async function submitCase() {
  try {
    const formData = collectFormData()
    
    const [success, result] = await callApi("POST", case_api_url, formData, csrf_token)
    console.log(result)
      if (success && result.success) {
        alert(`Case created successfully! Case ID: ${result.data.case_id}`)
        window.location.href = `/case-detail?case_id=${result.data.case_id}`
        // setTimeout(() => {
        // }, 2000)
      } else {
        const errorMessage = result.error || "Failed to create case"
        alert(errorMessage)
      }

  } catch (error) {
    console.error("Submit error:", error)
    alert("An error occurred while creating the case. Please try again.")
  } finally {
    
  }
}

