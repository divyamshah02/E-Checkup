// Case Details Functionality
document.addEventListener("DOMContentLoaded", () => {
  // Import Bootstrap
  const bootstrap = window.bootstrap

  // Get case ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const caseId = urlParams.get("id") || "LIC-2024-001"

  // Initialize page
  loadCaseDetails(caseId)
  setupEventListeners()

  function setupEventListeners() {
    // Quick action buttons
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        const btnText = this.textContent.trim()

        if (btnText.includes("Schedule VMER")) {
          handleScheduleVMER()
        } else if (btnText.includes("Contact Policy Holder")) {
          handleContactPolicyHolder()
        } else if (btnText.includes("Reassign Case")) {
          handleReassignCase()
        } else if (btnText.includes("Add Note")) {
          handleAddNote()
        } else if (btnText.includes("Upload")) {
          handleFileUpload()
        }
      })
    })

    // Auto-refresh case status every 30 seconds
    setInterval(refreshCaseStatus, 30000)
  }

  function loadCaseDetails(caseId) {
    // Simulate loading case details from API
    console.log("Loading case details for:", caseId)

    // Update page title and breadcrumb
    document.title = `Case ${caseId} - LIC Case Management`

    // Simulate real-time updates
    setTimeout(() => {
      updateTimelineProgress()
    }, 2000)
  }

  function handleScheduleVMER() {
    // Create modal for VMER scheduling
    const modalHtml = `
            <div class="modal fade" id="vmerModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Schedule VMER</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="vmerForm">
                                <div class="mb-3">
                                    <label for="vmerDate" class="form-label">Date</label>
                                    <input type="date" class="form-control" id="vmerDate" required>
                                </div>
                                <div class="mb-3">
                                    <label for="vmerTime" class="form-label">Time</label>
                                    <input type="time" class="form-control" id="vmerTime" required>
                                </div>
                                <div class="mb-3">
                                    <label for="vmerDoctor" class="form-label">Assigned Doctor</label>
                                    <select class="form-select" id="vmerDoctor" required>
                                        <option value="">Select doctor</option>
                                        <option value="dr1">Dr. Sharma - Cardiology</option>
                                        <option value="dr2">Dr. Patel - General Medicine</option>
                                        <option value="dr3">Dr. Kumar - Internal Medicine</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="confirmVMERSchedule()">Schedule</button>
                        </div>
                    </div>
                </div>
            </div>
        `

    document.body.insertAdjacentHTML("beforeend", modalHtml)
    const modal = new bootstrap.Modal(document.getElementById("vmerModal"))
    modal.show()

    // Set minimum date to today
    document.getElementById("vmerDate").min = new Date().toISOString().split("T")[0]
  }

  function handleContactPolicyHolder() {
    showAlert("Initiating call to +91 9876543210...", "info")

    // Simulate call initiation
    setTimeout(() => {
      showAlert("Call connected. Duration: 2:34 minutes", "success")
    }, 3000)
  }

  function handleReassignCase() {
    const modalHtml = `
            <div class="modal fade" id="reassignModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Reassign Case</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="reassignForm">
                                <div class="mb-3">
                                    <label for="newCoordinator" class="form-label">New Coordinator</label>
                                    <select class="form-select" id="newCoordinator" required>
                                        <option value="">Select coordinator</option>
                                        <option value="coord1">Mike Chen - Available (8 cases)</option>
                                        <option value="coord2">Lisa Patel - Available (10 cases)</option>
                                        <option value="coord3">David Kumar - Available (12 cases)</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="reassignReason" class="form-label">Reason for Reassignment</label>
                                    <textarea class="form-control" id="reassignReason" rows="3" placeholder="Enter reason for reassignment"></textarea>
                            </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="confirmReassignment()">Reassign</button>
                        </div>
                    </div>
                </div>
            </div>
        `

    document.body.insertAdjacentHTML("beforeend", modalHtml)
    const modal = new bootstrap.Modal(document.getElementById("reassignModal"))
    modal.show()
  }

  function handleAddNote() {
    const noteTextarea = document.querySelector('textarea[placeholder="Add a note or comment..."]')
    const noteText = noteTextarea.value.trim()

    if (!noteText) {
      showAlert("Please enter a note before adding", "warning")
      return
    }

    // Create new note element
    const noteHtml = `
            <div class="d-flex mb-3">
                <img src="/placeholder.svg?height=40&width=40" class="rounded-circle me-3" width="40" height="40" alt="User">
                <div class="flex-grow-1">
                    <div class="bg-light p-3 rounded">
                        <div class="d-flex justify-content-between align-items-start mb-1">
                            <strong>John Manager</strong>
                            <small class="text-muted">Just now</small>
                        </div>
                        <p class="mb-0">${noteText}</p>
                    </div>
                </div>
            </div>
        `

    // Add note to timeline
    const notesContainer = document.querySelector(".border-top.pt-3")
    notesContainer.insertAdjacentHTML("afterbegin", noteHtml)

    // Clear textarea
    noteTextarea.value = ""
    showAlert("Note added successfully", "success")
  }

  function handleFileUpload() {
    const input = document.createElement("input")
    input.type = "file"
    input.multiple = true
    input.accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx"

    input.onchange = (e) => {
      const files = Array.from(e.target.files)
      if (files.length > 0) {
        uploadFiles(files)
      }
    }

    input.click()
  }

  function uploadFiles(files) {
    files.forEach((file) => {
      // Simulate file upload
      showAlert(`Uploading ${file.name}...`, "info")

      setTimeout(() => {
        // Add file to documents table
        const tableBody = document.querySelector("tbody")
        const fileIcon = getFileIcon(file.type)
        const fileType = getFileType(file.name)

        const rowHtml = `
                <tr>
                    <td>
                        <i class="${fileIcon} me-2"></i>
                        ${file.name}
                    </td>
                    <td><span class="badge bg-info">${fileType}</span></td>
                    <td>John Manager</td>
                    <td>Just now</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-download"></i>
                        </button>
                    </td>
                </tr>
            `

        tableBody.insertAdjacentHTML("beforeend", rowHtml)
        showAlert(`${file.name} uploaded successfully`, "success")
      }, 2000)
    })
  }

  function getFileIcon(fileType) {
    if (fileType.includes("pdf")) return "fas fa-file-pdf text-danger"
    if (fileType.includes("image")) return "fas fa-file-image text-info"
    if (fileType.includes("word")) return "fas fa-file-word text-primary"
    return "fas fa-file text-secondary"
  }

  function getFileType(fileName) {
    const extension = fileName.split(".").pop().toLowerCase()
    const typeMap = {
      pdf: "Document",
      jpg: "Image",
      jpeg: "Image",
      png: "Image",
      doc: "Document",
      docx: "Document",
    }
    return typeMap[extension] || "File"
  }

  function updateTimelineProgress() {
    // Simulate timeline updates
    const activeItem = document.querySelector(".timeline-item.active")
    if (activeItem) {
      // Randomly progress timeline
      if (Math.random() > 0.7) {
        activeItem.classList.remove("active")
        activeItem.classList.add("completed")

        const nextItem = activeItem.nextElementSibling
        if (nextItem && nextItem.classList.contains("timeline-item")) {
          nextItem.classList.remove("pending")
          nextItem.classList.add("active")
        }
      }
    }
  }

  function refreshCaseStatus() {
    // Simulate real-time status updates
    console.log("Refreshing case status...")

    // Update last activity time
    const timeElements = document.querySelectorAll("small.text-muted")
    timeElements.forEach((element) => {
      if (element.textContent.includes("ago")) {
        // Update relative time (simplified)
        const currentText = element.textContent
        if (currentText.includes("minutes")) {
          const minutes = Number.parseInt(currentText) + 1
          element.textContent = `${minutes} minutes ago`
        }
      }
    })
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

    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove()
      }
    }, 5000)
  }

  // Global functions for modal actions
  window.confirmVMERSchedule = () => {
    const form = document.getElementById("vmerForm")
    if (form.checkValidity()) {
      const date = document.getElementById("vmerDate").value
      const time = document.getElementById("vmerTime").value
      const doctor =
        document.getElementById("vmerDoctor").options[document.getElementById("vmerDoctor").selectedIndex].text

      showAlert(`VMER scheduled for ${date} at ${time} with ${doctor}`, "success")

      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById("vmerModal"))
      modal.hide()

      // Update timeline
      setTimeout(() => {
        updateTimelineProgress()
      }, 1000)
    } else {
      showAlert("Please fill in all required fields", "warning")
    }
  }

  window.confirmReassignment = () => {
    const form = document.getElementById("reassignForm")
    if (form.checkValidity()) {
      const newCoordinator =
        document.getElementById("newCoordinator").options[document.getElementById("newCoordinator").selectedIndex].text
      const reason = document.getElementById("reassignReason").value

      showAlert(`Case reassigned to ${newCoordinator}`, "success")

      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById("reassignModal"))
      modal.hide()

      // Update case details
      setTimeout(() => {
        document.querySelector('dd:contains("Sarah Johnson")').textContent = newCoordinator.split(" - ")[0]
      }, 1000)
    } else {
      showAlert("Please select a coordinator", "warning")
    }
  }
})
