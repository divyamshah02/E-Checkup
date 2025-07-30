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
    populateCaseDetails(caseData)
    populateTimeline(caseData)
    setupEditModal(caseData)
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


// document.addEventListener("DOMContentLoaded", () => {
//   const urlParams = new URLSearchParams(window.location.search)
//   const caseId = urlParams.get("caseId")

//   // Retrieve the mock data from localStorage
//   const allCases = JSON.parse(localStorage.getItem("mockCases")) || []
//   // const caseData = allCases.find((c) => c.id === caseId)
//   const caseData = {
//         "id": 6,
//         "created_at": "02:19 | 24-07-2025",
//         "case_id": "VM8587334568",
//         "case_type": "vmer",
//         "policy_type": "new",
//         "policy_number": "POL12345678",
//         "sum_assured": "500000.00",
//         "priority": "urgent",
//         "due_date": "2025-07-27",
//         "payment_method": "lic",
//         "holder_name": "Ramesh Kumar",
//         "holder_phone": "9876543210",
//         "holder_email": "ramesh@example.com",
//         "lic_office_code": "BR001",
//         "assigned_coordinator_id": "CO1812745614",
//         "created_by": "divyam",
//         "assigned_telecaller_id": "TC7041213550",
//         "assigned_dc_id": null,
//         "assigned_vmer_med_co_id": "VM0853040119",
//         "video_url": "https://example.com/video.mp4",
//         "report_url": null,
//         "status": "submitted_to_lic",
//         "is_active": true,
//         "updated_at": "2025-07-24T02:19:53.576812+05:30",
//         "case_logs": [
//             {
//                 "id": 14,
//                 "timestamp": "02:19 | 24-07-2025",
//                 "case_id": "VM8587334568",
//                 "action_by": "divyam",
//                 "action": "Case Created",
//                 "remarks": null,
//                 "action_by_name": "Divyam Shah",
//                 "action_by_role": "hod"
//             },
//             {
//                 "id": 15,
//                 "timestamp": "02:19 | 24-07-2025",
//                 "case_id": "VM8587334568",
//                 "action_by": "CO1812745614",
//                 "action": "Assigned to Telecaller TC7041213550",
//                 "remarks": null,
//                 "action_by_name": "Test Coordinator",
//                 "action_by_role": "coordinator"
//             },
//             {
//                 "id": 16,
//                 "timestamp": "02:19 | 24-07-2025",
//                 "case_id": "VM8587334568",
//                 "action_by": "TC7041213550",
//                 "action": "Schedule Created",
//                 "remarks": null,
//                 "action_by_name": "Test TeleCaller",
//                 "action_by_role": "telecaller"
//             },
//             {
//                 "id": 17,
//                 "timestamp": "02:19 | 24-07-2025",
//                 "case_id": "VM8587334568",
//                 "action_by": "TC7041213550",
//                 "action": "Assigned to VMER Med Co VM0853040119",
//                 "remarks": null,
//                 "action_by_name": "Test TeleCaller",
//                 "action_by_role": "telecaller"
//             },
//             {
//                 "id": 18,
//                 "timestamp": "02:19 | 24-07-2025",
//                 "case_id": "VM8587334568",
//                 "action_by": "VM0853040119",
//                 "action": "Video recording uploaded by VMER Med Co",
//                 "remarks": null,
//                 "action_by_name": "Test VMER Med Co",
//                 "action_by_role": "vmer_med_co"
//             }
//         ],
//         "assigned_coordinator": {
//             "id": 2,
//             "name": "Test Coordinator",
//             "email": "testcoordinator@example.com"
//         }
//     }
//   console.log(caseData)
//   if (caseData) {
//     populateCaseDetails(caseData)
//     populateTimeline(caseData)
//     setupEditModal(caseData)
//   } else {
//     const mainContent = document.querySelector(".main-content")
//     if (mainContent) {
//       mainContent.innerHTML = `
//             <div class="alert alert-danger" role="alert">
//                 <strong>Error:</strong> Case with ID "${caseId}" not found. Please go back to the dashboard and select a valid case.
//             </div>`
//     }
//   }
// })

function populateCaseDetails(caseData) {
  document.getElementById("case-id-title").textContent = `Case Details: ${caseData.case_id}`
  document.getElementById("policy-holder-name").textContent = caseData.holder_name
  document.getElementById("policy-number").textContent = caseData.policy_number
  document.getElementById("sum-assured").textContent = caseData.sum_assured
  document.getElementById("contact-number").textContent = caseData.holder_phone
  document.getElementById("email-address").textContent = caseData.holder_email

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
    default:
      statusClass = "secondary"
  }
  statusBadge.className = `badge rounded-pill bg-${statusClass}-soft text-${statusClass}`
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
                    <span>by ${item.action_by}</span> &bull; <span>${item.timestamp}</span>
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
  document.getElementById("editCaseType").value = caseData.case_type.toUpperCase()
  document.getElementById("editCaseStatus").value = caseData.status
  document.getElementById("editPolicyHolderName").value = caseData.holder_name
  document.getElementById("editPolicyNumber").value = caseData.policy_number
  document.getElementById("editSumAssured").value = caseData.sum_assured
  document.getElementById("editContactNumber").value = caseData.holder_phone
  document.getElementById("editEmailAddress").value = caseData.holder_email
  document.getElementById("editAssignedTo").value = caseData.assigned_coordinator.name

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
        status: document.getElementById("editCaseStatus").value,
        policyHolder: document.getElementById("editPolicyHolderName").value,
        assignedTo: document.getElementById("editAssignedTo").value,
        details: {
          ...caseData,
          policyNumber: document.getElementById("editPolicyNumber").value,
          sumAssured: document.getElementById("editSumAssured").value,
          contact: document.getElementById("editContactNumber").value,
          email: document.getElementById("editEmailAddress").value,
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
