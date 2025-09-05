let currentStep = 1
const totalSteps = 3

let csrf_token = ""
let case_api_url = ""
let user_api_url = ""
let test_details_api_url = ""

let availableTests = []
let selectedTests = []
const selectedTestPrices = {}

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

// Declare callApi function
async function callApi(method, url, data = null, csrfToken = null) {
  const headers = {
    "Content-Type": "application/json",
  }
  if (csrfToken) {
    headers["X-CSRFToken"] = csrfToken
  }

  const response = await fetch(url, {
    method: method,
    headers: headers,
    body: data ? JSON.stringify(data) : null,
  })

  const result = await response.json()
  return [response.ok, result]
}

async function InitializeCreateCase(
  csrf_token_param,
  case_api_url_param,
  user_api_url_param,
  test_details_api_url_param,
) {
  csrf_token = csrf_token_param
  case_api_url = case_api_url_param
  user_api_url = user_api_url_param
  test_details_api_url = test_details_api_url_param

  populateDropdown(regionalOfficeSelect, Object.keys(officeData))
  updateStepDisplay()
  setupRealTimeValidation()
  await loadCoordinators()
  await loadAvailableTests()
  setupTestEventListeners()
  setupModalEventListeners()
}

async function loadAvailableTests() {
  try {
    const testsContainer = document.getElementById("testsContainer")
    testsContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading tests...</span>
        </div>
        <p class="mt-3 text-muted">Loading available tests...</p>
      </div>
    `

    const [success, result] = await callApi("GET", test_details_api_url)

    if (success && result.success) {
      availableTests = result.data
      renderTestCheckboxes()
    } else {
      testsContainer.innerHTML = `
        <div class="col-12 text-center py-4">
          <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Failed to load tests. Please refresh the page.
          </div>
        </div>
      `
    }
  } catch (error) {
    console.error("Failed to load tests:", error)
    document.getElementById("testsContainer").innerHTML = `
      <div class="col-12 text-center py-4">
        <div class="alert alert-danger">
          <i class="fas fa-times-circle me-2"></i>
          Error loading tests. Please try again.
        </div>
      </div>
    `
  }
}

function renderTestCheckboxes() {
  const testsContainer = document.getElementById("testsContainer")

  if (availableTests.length === 0) {
    testsContainer.innerHTML = `
      <div class="col-12 text-center py-4">
        <div class="alert alert-info">
          <i class="fas fa-info-circle me-2"></i>
          No tests available at the moment.
        </div>
      </div>
    `
    return
  }

  testsContainer.innerHTML = availableTests
    .map(
      (test) => `
    <div class="col-md-6 col-lg-4 mb-3 test-item" data-test-name="${test.test_name.toLowerCase()}">
      <div class="card test-card h-100 ${selectedTests.includes(test.test_name) ? "border-success bg-light" : ""}" data-test-id="${test.test_id}">
        <div class="card-body">
          <div class="form-check">
            <input class="form-check-input test-checkbox" type="checkbox" 
                   id="test_${test.test_id}" value="${test.test_name}" 
                   data-test-details='${JSON.stringify(test)}'
                   ${selectedTests.includes(test.test_name) ? "checked" : ""}>
            <label class="form-check-label fw-semibold" for="test_${test.test_id}">
              ${test.test_name}
            </label>
          </div>
          <div class="mt-3">
            <div class="row text-center">
              <div class="col-4">
                <div class="border rounded p-2">
                  <small class="text-muted d-block">DC</small>
                  <strong class="text-primary">₹${test.dc_charge}</strong>
                </div>
              </div>
              <div class="col-4">
                <div class="border rounded p-2">
                  <small class="text-muted d-block">Rural</small>
                  <strong class="text-success">₹${test.lic_rural_charge}</strong>
                </div>
              </div>
              <div class="col-4">
                <div class="border rounded p-2">
                  <small class="text-muted d-block">Urban</small>
                  <strong class="text-info">₹${test.lic_urban_charge}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    )
    .join("")

  updateModalSelectedCount()
}

function setupModalEventListeners() {
  // Test search functionality
  const testSearchInput = document.getElementById("testSearchInput")
  testSearchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase()
    const testItems = document.querySelectorAll(".test-item")

    testItems.forEach((item) => {
      const testName = item.dataset.testName
      if (testName.includes(searchTerm)) {
        item.style.display = "block"
      } else {
        item.style.display = "none"
      }
    })
  })

  // Clear all tests button
  document.getElementById("clearAllTests").addEventListener("click", () => {
    selectedTests.length = 0
    Object.keys(selectedTestPrices).forEach((key) => delete selectedTestPrices[key])

    document.querySelectorAll(".test-checkbox").forEach((checkbox) => {
      checkbox.checked = false
      checkbox.closest(".test-card").classList.remove("border-success", "bg-light")
    })

    updateModalSelectedCount()
    updateMainButtonState()
  })

  // Confirm selection button
  document.querySelectorAll(".confirmTestSelection").forEach(btn => {
    btn.addEventListener("click", () => {
      updateMainButtonState()
      updateSelectedTestsPreview()

      const modalElement = document.getElementById("testsModal")
      modalElement.querySelector('[data-bs-dismiss="modal"]').click()
    })
  })

  // Modal checkbox change handler
  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("test-checkbox")) {
      const testDetails = JSON.parse(e.target.dataset.testDetails)

      if (e.target.checked) {
        // Add to selected tests
        if (!selectedTests.includes(testDetails.test_name)) {
          selectedTests.push(testDetails.test_name)
          selectedTestPrices[testDetails.test_name] = {
            test_name: testDetails.test_name,
            dc_charge: testDetails.dc_charge,
            lic_rural_charge: testDetails.lic_rural_charge,
            lic_urban_charge: testDetails.lic_urban_charge,
          }
        }
        e.target.closest(".test-card").classList.add("border-success", "bg-light")
      } else {
        // Remove from selected tests
        selectedTests = selectedTests.filter((name) => name !== testDetails.test_name)
        delete selectedTestPrices[testDetails.test_name]
        e.target.closest(".test-card").classList.remove("border-success", "bg-light")
      }

      updateModalSelectedCount()
    }
  })
}

function updateModalSelectedCount() {
  document.getElementById("modalSelectedCount").textContent = selectedTests.length
}

function updateMainButtonState() {
  const selectTestsBtn = document.getElementById("selectTestsBtn")
  const selectTestsBtnText = document.getElementById("selectTestsBtnText")
  const selectedTestsBadge = document.getElementById("selectedTestsBadge")

  if (selectedTests.length > 0) {
    selectTestsBtn.classList.remove("btn-outline-primary")
    selectTestsBtn.classList.add("btn-success")
    selectTestsBtnText.textContent = "Update Tests"
    selectedTestsBadge.textContent = selectedTests.length
    selectedTestsBadge.classList.remove("d-none")
  } else {
    selectTestsBtn.classList.remove("btn-success")
    selectTestsBtn.classList.add("btn-outline-primary")
    selectTestsBtnText.textContent = "Select Tests"
    selectedTestsBadge.classList.add("d-none")
  }
}

function updateSelectedTestsPreview() {
  const selectedTestsPreview = document.getElementById("selectedTestsPreview")
  const selectedTestsList = document.getElementById("selectedTestsList")

  if (selectedTests.length > 0) {
    selectedTestsPreview.style.display = "block"
    selectedTestsList.innerHTML = selectedTests
      .map((testName) => `<span class="badge bg-primary me-1 mb-1">${testName}</span>`)
      .join("")
  } else {
    selectedTestsPreview.style.display = "none"
  }
}

function setupTestEventListeners() {
  // Refresh tests button
  document.getElementById("refreshTests").addEventListener("click", async () => {
    await loadAvailableTests()
  })
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
  document.getElementById("summaryCaseType").textContent = selectedCaseType ? selectedCaseType.value.toUpperCase() : "-"

  const policyType = policyTypeSelect.value
  document.getElementById("summaryPolicyType").textContent = policyType || "-"
  summaryPolicyNumberLabel.textContent = policyType === "new" ? "Proposal Number:" : "Policy Number:"
  document.getElementById("summaryPolicyNumber").textContent = document.getElementById("policyNumber").value || "-"
  document.getElementById("summaryHolderName").textContent = document.getElementById("holderName").value || "-"
  document.getElementById("summaryHolderPhone").textContent = document.getElementById("holderPhone").value || "-"

  document.getElementById("summaryLicGstNo").textContent = document.getElementById("licGstNo").value || "-"
  document.getElementById("summaryLicType").textContent = document.getElementById("licType").value || "-"
  document.getElementById("summaryIntimationDate").textContent = document.getElementById("intimationDate").value || "-"
  document.getElementById("summaryHolderDob").textContent = document.getElementById("holderDob").value || "-"
  document.getElementById("summaryHolderGender").textContent = document.getElementById("holderGender").value || "-"
  document.getElementById("summaryHolderAddress").textContent = document.getElementById("holderAddress").value || "-"
  document.getElementById("summaryHolderState").textContent = document.getElementById("holderState").value || "-"
  document.getElementById("summaryHolderCity").textContent = document.getElementById("holderCity").value || "-"
  document.getElementById("summaryHolderPincode").textContent = document.getElementById("holderPincode").value || "-"
  document.getElementById("summaryProposedSumInsured").textContent = document.getElementById("proposedSumInsured").value
    ? `₹${document.getElementById("proposedSumInsured").value}`
    : "-"
  document.getElementById("summarySumInsuredUnderConsideration").textContent = document.getElementById(
    "sumInsuredUnderConsideration",
  ).value
    ? `₹${document.getElementById("sumInsuredUnderConsideration").value}`
    : "-"

  document.getElementById("summaryTests").textContent = selectedTests.length > 0 ? selectedTests.join(", ") : "-"
  document.getElementById("summaryTestPrice").innerHTML =
    selectedTests.length > 0 ? `<small>${selectedTests.length} tests selected with pricing details</small>` : "-"

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

function collectFormData() {
  const selectedCaseType = document.querySelector('input[name="caseType"]:checked')
  let case_type = selectedCaseType.value
  if (selectedCaseType.value == "dc-visit") {
    case_type = "dc_visit"
  }
  const formData = {
    case_type: case_type,
    policy_type: document.getElementById("policyType").value,
    policy_number: document.getElementById("policyNumber").value,
    priority: document.getElementById("priority").value,
    due_date: document.getElementById("dueDate").value,
    holder_name: document.getElementById("holderName").value,
    holder_phone: document.getElementById("holderPhone").value,
    holder_email: document.getElementById("holderEmail").value || null,
    lic_office_code: document.getElementById("licUser").value,
    assigned_coordinator_id: document.getElementById("assignCoordinator").value,
    payment_method: document.getElementById("paymentMethod").value,
    lic_gst_no: document.getElementById("licGstNo").value || null,
    lic_type: document.getElementById("licType").value || null,
    intimation_date: document.getElementById("intimationDate").value || null,
    holder_dob: document.getElementById("holderDob").value || null,
    holder_gender: document.getElementById("holderGender").value || null,
    holder_address: document.getElementById("holderAddress").value || null,
    holder_state: document.getElementById("holderState").value || null,
    holder_city: document.getElementById("holderCity").value || null,
    holder_pincode: document.getElementById("holderPincode").value || null,
    proposed_sum_insured: document.getElementById("proposedSumInsured").value || null,
    sum_insured_under_consideration: document.getElementById("sumInsuredUnderConsideration").value || null,
    tests: selectedTests,
    test_price: selectedTestPrices,
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
