document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search)
  const caseId = urlParams.get("caseId")

  // Retrieve the mock data from localStorage
  const allCases = JSON.parse(localStorage.getItem("mockCases")) || []
  const caseData = allCases.find((c) => c.id === caseId)

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
})

function populateCaseDetails(caseData) {
  document.getElementById("case-id-title").textContent = `Case Details: ${caseData.id}`
  document.getElementById("policy-holder-name").textContent = caseData.policyHolder
  document.getElementById("policy-number").textContent = caseData.details.policyNumber
  document.getElementById("sum-assured").textContent = caseData.details.sumAssured
  document.getElementById("contact-number").textContent = caseData.details.contact
  document.getElementById("email-address").textContent = caseData.details.email

  const statusBadge = document.getElementById("case-status-badge")
  statusBadge.textContent = caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1)
  let statusClass = ""
  switch (caseData.status) {
    case "completed":
      statusClass = "success"
      break
    case "pending":
      statusClass = "warning"
      break
    case "in-progress":
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
    "Appointment Scheduled": "fa-calendar-alt",
    "DC Visit Completed": "fa-hospital-user",
    "VMER Call Completed": "fa-video",
    "Reports Uploaded": "fa-file-upload",
    "Case Closed": "fa-check-circle",
  }

  caseData.history.forEach((item, index) => {
    const isLastItem = index === caseData.history.length - 1
    const itemClass =
      caseData.status === "completed" || index < caseData.history.length - 1 ? "completed" : "in-progress"

    const timelineItem = `
        <div class="timeline-item ${itemClass}">
            <div class="timeline-icon">
                <i class="fas ${stageIcons[item.stage] || "fa-info-circle"}"></i>
            </div>
            <div class="timeline-content">
                <h6>${item.stage}</h6>
                <p class="mb-1">${item.notes}</p>
                <div class="timeline-meta">
                    <span>by ${item.user}</span> &bull; <span>${item.date}</span>
                </div>
            </div>
        </div>
    `
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
  document.getElementById("editCaseType").value = caseData.type.toUpperCase()
  document.getElementById("editCaseStatus").value = caseData.status
  document.getElementById("editPolicyHolderName").value = caseData.policyHolder
  document.getElementById("editPolicyNumber").value = caseData.details.policyNumber
  document.getElementById("editSumAssured").value = caseData.details.sumAssured
  document.getElementById("editContactNumber").value = caseData.details.contact
  document.getElementById("editEmailAddress").value = caseData.details.email
  document.getElementById("editAssignedTo").value = caseData.assignedTo

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
          ...caseData.details,
          policyNumber: document.getElementById("editPolicyNumber").value,
          sumAssured: document.getElementById("editSumAssured").value,
          contact: document.getElementById("editContactNumber").value,
          email: document.getElementById("editEmailAddress").value,
        },
      }

      // Update the case data
      Object.assign(caseData, updatedData)

      // Update localStorage
      const allCases = JSON.parse(localStorage.getItem("mockCases")) || []
      const caseIndex = allCases.findIndex((c) => c.id === caseData.id)
      if (caseIndex !== -1) {
        allCases[caseIndex] = caseData
        localStorage.setItem("mockCases", JSON.stringify(allCases))
      }

      // Add history entry for the edit
      caseData.history.push({
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
