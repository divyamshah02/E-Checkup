let currentStep = 1
const totalSteps = 3

let csrf_token = ""
let case_api_url = ""
let user_api_url = ""
let test_details_api_url = ""
let lic_hierarchy_url = ""
let create_case_excel_url = ""
let insurance_company_api_url = ""
let tata_aig_office_api_url = ""

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

const insuranceCompanySelect = document.getElementById("insuranceCompany")

const regionalOfficeSelect = document.getElementById("regionalOffice")
const divisionalOfficeSelect = document.getElementById("divisionalOffice")
const branchOfficeSelect = document.getElementById("branchOffice")

const tataAigOfficeSelect = document.getElementById("tataAigOffice")

let officeData = {}
let tataAigOffices = []

async function InitializeCreateCase(
  csrf_token_param,
  case_api_url_param,
  user_api_url_param,
  test_details_api_url_param,
  lic_hierarchy_url_param,
  create_case_excel_url_param,
  insurance_company_api_url_param,
  tata_aig_office_api_url_param,
) {
  csrf_token = csrf_token_param
  case_api_url = case_api_url_param
  user_api_url = user_api_url_param
  test_details_api_url = test_details_api_url_param
  lic_hierarchy_url = lic_hierarchy_url_param
  create_case_excel_url = create_case_excel_url_param
  insurance_company_api_url = insurance_company_api_url_param
  tata_aig_office_api_url = tata_aig_office_api_url_param

  await loadInsuranceCompanies()
  await loadLicHierarchy()
  await loadTataAigOffices()

  updateStepDisplay()
  setupRealTimeValidation()
  await loadCoordinators()
  await loadAvailableTests()
  setupTestEventListeners()
  setupModalEventListeners()
}

async function loadInsuranceCompanies() {
  try {
    const [success, result] = await callApi("GET", insurance_company_api_url)

    if (success && result.success) {
      const companies = result.data
      insuranceCompanySelect.innerHTML = '<option value="">Select insurance company</option>'

      companies.forEach((company) => {
        const option = document.createElement("option")
        option.value = company.code
        option.textContent = company.name
        option.dataset.hasHierarchy = company.has_hierarchy
        insuranceCompanySelect.appendChild(option)
      })
    } else {
      alert(`Failed to load insurance companies. Please refresh the page:- ${result.error}`)
    }
  } catch (error) {
    alert(`Failed to load insurance companies. Please refresh the page:- ${error}`)
  }
}

async function loadLicHierarchy() {
  try {
    const [success, result] = await callApi("GET", lic_hierarchy_url)

    if (success && result.success) {
      officeData = result.data
    } else {
      alert(`Failed to load LIC Hierarchy. Please refresh the page:- ${result.error}`)
    }
  } catch (error) {
    alert(`Failed to load LIC Hierarchy. Please refresh the page:- ${error}`)
  }
}

async function loadTataAigOffices() {
  try {
    const [success, result] = await callApi("GET", tata_aig_office_api_url)

    if (success && result.success) {
      tataAigOffices = result.data
    } else {
      console.error(`Failed to load Tata AIG offices: ${result.error}`)
    }
  } catch (error) {
    console.error(`Failed to load Tata AIG offices: ${error}`)
  }
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

  document.querySelectorAll(".confirmTestSelection").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateMainButtonState()
      updateSelectedTestsPreview()

      const modalElement = document.getElementById("testsModal")
      modalElement.querySelector('[data-bs-dismiss="modal"]').click()
    })
  })

  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("test-checkbox")) {
      const testDetails = JSON.parse(e.target.dataset.testDetails)

      if (e.target.checked) {
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
  document.querySelectorAll(".is-invalid").forEach((field) => {
    field.classList.remove("is-invalid")
  })

  document.getElementById("caseTypeError").classList.remove("show")
  form.classList.remove("was-validated")
}

function validateCurrentStep() {
  const currentStepElement = document.getElementById(`step${currentStep}`)
  const requiredFields = currentStepElement.querySelectorAll("[required]")
  let isValid = true

  clearValidationErrors()

  requiredFields.forEach((field) => {
    if (!field.checkValidity() || (field.type !== "radio" && field.value.trim() === "")) {
      field.classList.add("is-invalid")
      isValid = false
    }
  })

  if (currentStep === 1) {
    const caseTypeSelected = document.querySelector('input[name="caseType"]:checked')
    if (!caseTypeSelected) {
      document.getElementById("caseTypeError").classList.add("show")
      isValid = false
    }

    const selectedCaseType = caseTypeSelected?.value
    if (selectedCaseType === "dc-visit") {
      const paymentMethod = document.getElementById("paymentMethod")
      if (!paymentMethod.value) {
        paymentMethod.classList.add("is-invalid")
        isValid = false
      }
    }
  }

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

  document.getElementById("summaryInsGstNo").textContent = document.getElementById("insGstNo").value || "-"
  document.getElementById("summaryInsType").textContent = document.getElementById("insType").value || "-"
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

  const insuranceCompany = insuranceCompanySelect.value
  document.getElementById("summaryInsuranceCompany").textContent =
    insuranceCompanySelect.options[insuranceCompanySelect.selectedIndex]?.text || "-"

  document.getElementById("summaryInsAgent").textContent = document.getElementById("insAgent").value || "-"

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
      await submitCase()
    }
  }
})

prevBtn.addEventListener("click", () => {
  if (currentStep > 1) {
    currentStep--
    updateStepDisplay()
    clearValidationErrors()
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

    document.getElementById("caseTypeError").classList.remove("show")

    document.querySelectorAll(".case-type-card").forEach((c) => c.classList.remove("selected"))
    this.classList.add("selected")

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

insuranceCompanySelect.addEventListener("change", () => {
  const selectedCompany = insuranceCompanySelect.value
  const selectedOption = insuranceCompanySelect.options[insuranceCompanySelect.selectedIndex]
  const hasHierarchy = selectedOption?.dataset.hasHierarchy === "true"

  const licHierarchySection = document.getElementById("licOfficeHierarchy")
  const tataAigOfficeSection = document.getElementById("tataAigOfficeSelection")

  if (selectedCompany === "LIC" || hasHierarchy) {
    // Show LIC hierarchy
    licHierarchySection.classList.remove("d-none")
    tataAigOfficeSection.classList.add("d-none")

    // Make LIC fields required
    regionalOfficeSelect.setAttribute("required", "required")
    divisionalOfficeSelect.setAttribute("required", "required")
    branchOfficeSelect.setAttribute("required", "required")
    tataAigOfficeSelect.removeAttribute("required")

    // Populate LIC hierarchy
    populateDropdown(regionalOfficeSelect, Object.keys(officeData))
  } else if (selectedCompany === "TATA_AIG" || !hasHierarchy) {
    // Show Tata AIG simple office selection
    licHierarchySection.classList.add("d-none")
    tataAigOfficeSection.classList.remove("d-none")

    // Make Tata AIG field required
    tataAigOfficeSelect.setAttribute("required", "required")
    regionalOfficeSelect.removeAttribute("required")
    divisionalOfficeSelect.removeAttribute("required")
    branchOfficeSelect.removeAttribute("required")

    // Populate Tata AIG offices
    tataAigOfficeSelect.innerHTML = '<option value="">Select office</option>'
    tataAigOffices.forEach((office) => {
      const option = document.createElement("option")
      option.value = office.code
      option.textContent = `${office.name} - ${office.city}`
      tataAigOfficeSelect.appendChild(option)
    })
  } else {
    // Hide both
    licHierarchySection.classList.add("d-none")
    tataAigOfficeSection.classList.add("d-none")
  }
})

regionalOfficeSelect.addEventListener("change", () => {
  const selectedRegion = regionalOfficeSelect.value
  divisionalOfficeSelect.innerHTML = '<option value="">Select...</option>'
  branchOfficeSelect.innerHTML = '<option value="">Select...</option>'

  divisionalOfficeSelect.classList.remove("is-invalid")
  branchOfficeSelect.classList.remove("is-invalid")

  divisionalOfficeSelect.disabled = true
  branchOfficeSelect.disabled = true

  if (selectedRegion) {
    populateDropdown(divisionalOfficeSelect, Object.keys(officeData[selectedRegion]))
    divisionalOfficeSelect.disabled = false
  }
})

divisionalOfficeSelect.addEventListener("change", () => {
  const selectedRegion = regionalOfficeSelect.value
  const selectedDivision = divisionalOfficeSelect.value
  branchOfficeSelect.innerHTML = '<option value="">Select...</option>'

  branchOfficeSelect.classList.remove("is-invalid")

  branchOfficeSelect.disabled = true

  if (selectedDivision) {
    populateDropdown(branchOfficeSelect, Object.keys(officeData[selectedRegion][selectedDivision]))
    branchOfficeSelect.disabled = false
  }
})

function collectFormData() {
  const selectedCaseType = document.querySelector('input[name="caseType"]:checked')
  let case_type = selectedCaseType.value
  if (selectedCaseType.value == "dc-visit") {
    case_type = "dc_visit"
  }

  const insuranceCompany = insuranceCompanySelect.value
  let officeCode = ""

  if (insuranceCompany === "LIC") {
    officeCode = branchOfficeSelect.value
  } else if (insuranceCompany === "TATA_AIG") {
    officeCode = tataAigOfficeSelect.value
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
    insurance_company: insuranceCompany,
    ins_office_code: officeCode,
    ins_agent: document.getElementById("insAgent").value,
    assigned_coordinator_id: document.getElementById("assignCoordinator").value,
    payment_method: document.getElementById("paymentMethod").value,
    lic_gst_no: document.getElementById("insGstNo").value || null,
    lic_type: document.getElementById("insType").value || null,
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
    special_instructions: document.getElementById("specialInstructions").value || null,
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

document.getElementById("uploadExcelBtn").addEventListener("click", () => {
  document.getElementById("excelFileInput").click()
})

document.getElementById("excelFileInput").addEventListener("change", async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append("file", file)

  try {
    const [success, result] = await callApi("POST", create_case_excel_url, formData, csrf_token, true)
    console.log(result)
    if (success && result.success) {
      let reportMsg = `✅ Total Cases Created: ${result.total_cases_created}\n❌ Failed Cases: ${result.total_failed_cases}`

      if (result.failed_cases && result.failed_cases.length > 0) {
        reportMsg += `\n\n--- Failed Cases ---\n`
        result.failed_cases.forEach((fc) => {
          reportMsg += `Row ${fc.row_index} (${fc.holder_name}) → ${JSON.stringify(fc.reason)}\n`
        })
      }

      alert(reportMsg)
    } else {
      alert("Upload failed: " + (result.error || "Unknown error"))
    }
  } catch (error) {
    console.error("Excel upload error:", error)
    alert("An error occurred while uploading the Excel file.")
  } finally {
    document.getElementById("excelFileInput").value = ""
  }
})
