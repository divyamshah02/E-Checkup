let case_detail_url = null
let csrf_token = null
let caseId = null
let caseData = null


async function InitializeCaseDetails(csrf_token_param, case_detail_url_param, case_id_param) {
  case_detail_url = case_detail_url_param
  csrf_token = csrf_token_param
  caseId = case_id_param

  await fetchCaseDetails()

  if (caseData) {
    await loadCoordinators()
    populateCaseDetails(caseData)
    populateTimeline(caseData)
    setupEditModal(caseData)
    populateDocuments()
  } else {
    const mainContent = document.querySelector(".main-content")
    if (mainContent) {
      mainContent.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <strong>Error:</strong> Case with ID "${caseId}" not found. Please go back to the dashboard and select a valid case.
            </div>`
    }
  }
}

async function loadCoordinators() {
  try {
    const full_url = `/user-api/user-api?role=coordinator`
    const [success, result] = await callApi("GET", full_url)
    if (success && result.success) {
      const coordinators = result.data

      const coordinatorSelect = document.getElementById("editAssignedTo")
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

async function fetchCaseDetails() {
  const fullUrl = `${case_detail_url}?case_id=${caseId}`
  const [success, result] = await callApi("GET", fullUrl)

  if (success && result.success) {
    caseData = result.data
  } else {
    console.error("Failed to load case details:", result.error)
    caseData = null
  }
}

function populateCaseDetails(caseData) {
  document.getElementById("case-id-title").textContent = `Case Details: ${caseData.case_id}`
  document.getElementById("policy-holder-name").textContent = caseData.holder_name
  document.getElementById("policy-number").textContent = caseData.policy_number
  document.getElementById("sum_insured_under_consideration").textContent = caseData.sum_insured_under_consideration
  document.getElementById("proposed_sum_insured").textContent = caseData.proposed_sum_insured
  document.getElementById("contact-number").textContent = caseData.holder_phone
  document.getElementById("email-address").textContent = caseData.holder_email

  if (document.getElementById("holder-dob")) {
    document.getElementById("holder-dob").textContent = caseData.holder_dob || "Not provided"
  }
  if (document.getElementById("holder-gender")) {
    document.getElementById("holder-gender").textContent = caseData.holder_gender || "Not provided"
  }
  if (document.getElementById("holder-address")) {
    document.getElementById("holder-address").textContent = caseData.holder_address || "Not provided"
  }
  if (document.getElementById("holder-state")) {
    document.getElementById("holder-state").textContent = caseData.holder_state || "Not provided"
  }
  if (document.getElementById("holder-city")) {
    document.getElementById("holder-city").textContent = caseData.holder_city || "Not provided"
  }
  if (document.getElementById("holder-pincode")) {
    document.getElementById("holder-pincode").textContent = caseData.holder_pincode || "Not provided"
  }
  document.getElementById("holder-test").textContent = caseData.tests.join(", ")

  const statusBadge = document.getElementById("case-status-badge")
  statusBadge.textContent = caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1)
  let statusClass = ""
  switch (caseData.status) {
    case "completed":
      statusClass = "success"
      break
    case "submitted_to_lic":
      statusClass = "success"
      break
    case "rescheduled":
      statusClass = "warning"
      break
    case "cancelled":
      statusClass = "danger"
      break
    case "scheduled":
      statusClass = "primary"
      break
    case "issue":
      statusClass = "danger"
      break
    default:
      statusClass = "secondary"
  }
  statusBadge.className = `badge rounded-pill bg-${statusClass}`

  if (caseData.status == "issue") {
    const issue_type = caseData.issue_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    document.getElementById("issue-card").style.display = ""
    document.getElementById("issue-body").textContent = `${issue_type} - ${caseData.issue_reason}`
  }
}

function populateTimeline(caseData) {
  const timelineContainer = document.getElementById("case-timeline")
  if (!timelineContainer) return
  timelineContainer.innerHTML = ""

  const stageIcons = {
    "Case Created": "fa-plus-circle",
    "Coordinator Assigned": "fa-user-check",
    "Schedule Created": "fa-calendar-alt",
    "Diagnostic report uploaded by DC": "fa-hospital-user",
    "Video recording uploaded by VMER Med Co": "fa-video",
    "Reports Uploaded": "fa-file-upload",
    "Case Updated": "fa-check-circle",
  }

  caseData.case_logs.forEach((item, index) => {
    console.log(item)
    const isLastItem = index === caseData.case_logs.length - 1
    const itemClass =
      caseData.status === "submitted_to_lic" || index < caseData.case_logs.length - 1 ? "submitted_to_lic" : "secondary"

    const timelineItem = `
        <div class="timeline-item ${itemClass}">
            <div class="timeline-icon">
                <i class="fas ${stageIcons[item.action] || "fa-info-circle"} text-success"></i>
            </div>
            <div class="timeline-content">
                <h6>${item.action}</h6>                
                <div class="timeline-meta">
                    <span>by ${item.action_by_name}</span> &bull; <span>${item.timestamp}</span>
                </div>
            </div>
        </div>
    `
    // <p class="mb-1">${item.notes}</p>
    timelineContainer.innerHTML += timelineItem
  })
}

function setupEditModal(caseData) {
  const editBtn = document.getElementById("editCaseBtn")
  const editModal = document.getElementById("editCaseModal")
  const editForm = document.getElementById("editCaseForm")

  if (!editBtn || !editModal || !editForm) return

  // Show modal when edit button is clicked
  editBtn.addEventListener("click", () => {
    populateEditForm(caseData)
    const modal = new window.bootstrap.Modal(editModal)
    modal.show()
  })

  // Handle form submission
  editForm.addEventListener("submit", (e) => {
    e.preventDefault()
    if (validateEditForm()) {
      saveChanges(caseData)
    }
  })

  // Real-time validation
  setupEditFormValidation()
}

function populateEditForm(caseData) {
  // Populate form fields with current data
  console.log(caseData)
  document.getElementById("editCaseType").value = caseData.case_type.toUpperCase()
  document.getElementById("editPolicyHolderName").value = caseData.holder_name
  document.getElementById("editPolicyNumber").value = caseData.policy_number
  document.getElementById("editSumInsuredUnderConsideration").value = caseData.sum_insured_under_consideration
  document.getElementById("editProposedSumInsured").value = caseData.proposed_sum_insured
  document.getElementById("editContactNumber").value = caseData.holder_phone
  document.getElementById("editEmailAddress").value = caseData.holder_email
  document.getElementById("editAssignedTo").value = caseData.assigned_coordinator_id

  if (document.getElementById("editHolderDob")) {
    document.getElementById("editHolderDob").value = caseData.holder_dob || ""
  }
  if (document.getElementById("editHolderGender")) {
    document.getElementById("editHolderGender").value = caseData.holder_gender || ""
  }
  if (document.getElementById("editHolderAddress")) {
    document.getElementById("editHolderAddress").value = caseData.holder_address || ""
  }
  if (document.getElementById("editHolderState")) {
    document.getElementById("editHolderState").value = caseData.holder_state || ""
  }
  if (document.getElementById("editHolderCity")) {
    document.getElementById("editHolderCity").value = caseData.holder_city || ""
  }
  if (document.getElementById("editHolderPincode")) {
    document.getElementById("editHolderPincode").value = caseData.holder_pincode || ""
  }

  // Clear any previous validation states
  clearEditFormValidation()
}

function validateEditForm() {
  const form = document.getElementById("editCaseForm")
  const requiredFields = form.querySelectorAll("[required]")
  let isValid = true

  // Clear previous validation
  clearEditFormValidation()

  // Validate required fields
  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      field.classList.add("is-invalid")
      isValid = false
    }
  })

  // Validate email if provided
  const emailField = document.getElementById("editEmailAddress")
  if (emailField.value && !emailField.checkValidity()) {
    emailField.classList.add("is-invalid")
    isValid = false
  }

  if (!isValid) {
    form.classList.add("was-validated")
  }

  return isValid
}

function clearEditFormValidation() {
  const form = document.getElementById("editCaseForm")
  form.classList.remove("was-validated")
  form.querySelectorAll(".is-invalid").forEach((field) => {
    field.classList.remove("is-invalid")
  })
}

function setupEditFormValidation() {
  const form = document.getElementById("editCaseForm")
  const inputs = form.querySelectorAll("input, select")

  inputs.forEach((input) => {
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
}

function saveChanges(caseData) {
  const saveBtn = document.querySelector("#editCaseForm button[type='submit']")
  const originalText = saveBtn.innerHTML

  // Show loading state
  saveBtn.classList.add("btn-loading")
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...'
  saveBtn.disabled = true

  // Simulate API call delay
  setTimeout(() => {
    try {
      // Get updated values from form
      const updatedData = {
        policyHolder: document.getElementById("editPolicyHolderName").value,
        assignedTo: document.getElementById("editAssignedTo").value,
        details: {
          ...caseData,
          policyNumber: document.getElementById("editPolicyNumber").value,
          sumInsuredUnderConsideration: document.getElementById("editSumInsuredUnderConsideration").value,
          proposedSumInsured: document.getElementById("editProposedSumInsured").value,
          contact: document.getElementById("editContactNumber").value,
          email: document.getElementById("editEmailAddress").value,
          holderDob: document.getElementById("editHolderDob").value,
          holderGender: document.getElementById("editHolderGender").value,
          holderAddress: document.getElementById("editHolderAddress").value,
          holderState: document.getElementById("editHolderState").value,
          holderCity: document.getElementById("editHolderCity").value,
          holderPincode: document.getElementById("editHolderPincode").value,
        },
      }

      // Update the case data
      Object.assign(caseData, updatedData)

      // Update localStorage
      // const allCases = JSON.parse(localStorage.getItem("mockCases")) || []
      // const caseIndex = allCases.findIndex((c) => c.id === caseData.id)
      // if (caseIndex !== -1) {
      //   allCases[caseIndex] = caseData
      //   localStorage.setItem("mockCases", JSON.stringify(allCases))
      // }

      // Add history entry for the edit
      caseData.case_logs.push({
        stage: "Case Updated",
        user: "HOD",
        date: new Date().toISOString().split("T")[0],
        notes: "Case details updated by HOD",
      })

      // Update the display
      populateCaseDetails(caseData)
      populateTimeline(caseData)
      
      // TODO: Update the database
      
      // Show success message
      showSuccessMessage("Case details updated successfully!")

      // Close modal
      const modal = window.bootstrap.Modal.getInstance(document.getElementById("editCaseModal"))
      modal.hide()
    } catch (error) {
      console.error("Error saving changes:", error)
      showErrorMessage("Failed to save changes. Please try again.")
    } finally {
      // Reset button state
      saveBtn.classList.remove("btn-loading")
      saveBtn.innerHTML = originalText
      saveBtn.disabled = false
    }
  }, 1500) // Simulate network delay
}

function showSuccessMessage(message) {
  const alertHtml = `
    <div class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="fas fa-check-circle me-2"></i>${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `

  const contentBody = document.querySelector(".content-body")
  contentBody.insertAdjacentHTML("afterbegin", alertHtml)

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    const alert = document.querySelector(".alert-success")
    if (alert) {
      const bsAlert = new window.bootstrap.Alert(alert)
      bsAlert.close()
    }
  }, 5000)
}

function showErrorMessage(message) {
  const alertHtml = `
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="fas fa-exclamation-circle me-2"></i>${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `

  const contentBody = document.querySelector(".content-body")
  contentBody.insertAdjacentHTML("afterbegin", alertHtml)

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    const alert = document.querySelector(".alert-danger")
    if (alert) {
      const bsAlert = new window.bootstrap.Alert(alert)
      bsAlert.close()
    }
  }, 5000)
}

async function populateDocuments() {
  const container = document.getElementById("view-reports-section")
  
  let text_content = []
  let documents = []

  let is_report_uploaded = false
  if (caseData.video_url) {
    documents.push(caseData.video_url)
    text_content.push('VMER_Report.pdf')
    is_report_uploaded = true
  }
  if (caseData.report_url) {
    documents.push(caseData.report_url)
    text_content.push('Medical_Report.pdf')
    is_report_uploaded = true
  }

  if (is_report_uploaded) [
    createDocumentList(documents, text_content)
  ]
}

function createDocumentList(documentList, text_content, created_at='12-05-2025') {
  const container = document.getElementById('view-reports-section');

  let doc_index = 0;
  let doc_html = "";
  documentList.forEach((doc) => {
    doc_index += 1;
    let text = text_content[doc_index-1]
    // doc_path = String(doc).replace('\\', '/');
        doc_path = String(doc);
    doc_html += `<div class="d-flex align-items-center py-3 px-2 mb-2 document-card"
                            onclick="openDocModal('${doc_path}', '${text}')">
                            <i class="fa fa-file-pdf fa-xl text-danger"></i>&nbsp;&nbsp;&nbsp; <u>${text}</u>
                            <div class="ms-auto"><a class="fa fa-download fa-xl mx-2 text-white" href="${doc}" download="${String(doc).replace('https://echeckup.s3.ap-south-1.amazonaws.com/test/', '')}" id="doc-${doc_index}-downloader"></a></div>
    </div>`

  });

  container.innerHTML = '';
  container.innerHTML = doc_html;

  doc_index = 0;
  documentList.forEach((doc) => {
    doc_index += 1;
    document.getElementById(`doc-${doc_index}-downloader`).addEventListener('click', (event) => {
      event.stopPropagation();
    });
  });

}

function openDocModal(doc_path, doc_name) {
  displayDocument(doc_path);
  document.getElementById('viewDocumentModalLabel').innerText = doc_name;
  const myModal = new bootstrap.Modal(document.getElementById('viewDocumentModal'));
  myModal.show();
}
