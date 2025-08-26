// Enhanced Case Details Functionality
document.addEventListener("DOMContentLoaded", () => {
  // Initialize enhanced features
  initializeEnhancedFeatures()
  setupEventListeners()
  loadCaseData()
  startRealTimeUpdates()

  function initializeEnhancedFeatures() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))

    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    popoverTriggerList.map((popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl))

    // Set minimum date for VMER scheduling
    const vmerDateInput = document.getElementById("vmerDate")
    if (vmerDateInput) {
      vmerDateInput.min = new Date().toISOString().split("T")[0]
    }

    // Initialize document category filters
    setupDocumentFilters()

    // Initialize communication filters
    setupCommunicationFilters()
  }

  function setupEventListeners() {
    // Quick action buttons
    document.querySelectorAll(".action-btn").forEach((btn) => {
      btn.addEventListener("click", handleQuickAction)
    })

    // Tab change events
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach((tab) => {
      tab.addEventListener("shown.bs.tab", handleTabChange)
    })

    // Document upload
    const uploadBtn = document.getElementById("uploadDocumentBtn")
    if (uploadBtn) {
      uploadBtn.addEventListener("click", handleDocumentUpload)
    }

    // Case action buttons
    document.getElementById("shareCaseBtn")?.addEventListener("click", handleShareCase)
    document.getElementById("duplicateCaseBtn")?.addEventListener("click", handleDuplicateCase)
    document.getElementById("exportCaseBtn")?.addEventListener("click", handleExportCase)
    document.getElementById("archiveCaseBtn")?.addEventListener("click", handleArchiveCase)

    // Priority and assignment changes
    document.getElementById("changePriorityBtn")?.addEventListener("click", handleChangePriority)
    document.getElementById("reassignCaseBtn")?.addEventListener("click", handleReassignCase)
    document.getElementById("escalateCaseBtn")?.addEventListener("click", handleEscalateCase)

    // Real-time features
    setupRealTimeFeatures()
  }

  function handleQuickAction(event) {
    const action = event.currentTarget.getAttribute("data-action")

    switch (action) {
      case "schedule-vmer":
        const modal = new bootstrap.Modal(document.getElementById("scheduleVMERModal"))
        modal.show()
        break
      case "contact-holder":
        initiateCall()
        break
      case "send-sms":
        showSMSModal()
        break
      case "add-note":
        showAddNoteModal()
        break
    }
  }

  function handleTabChange(event) {
    const targetTab = event.target.getAttribute("data-bs-target")

    // Add fade-in animation to tab content
    const tabContent = document.querySelector(targetTab)
    if (tabContent) {
      tabContent.classList.add("fade-in")
      setTimeout(() => tabContent.classList.remove("fade-in"), 500)
    }

    // Load tab-specific data
    switch (targetTab) {
      case "#documents":
        loadDocuments()
        break
      case "#communication":
        loadCommunicationHistory()
        break
      case "#scheduling":
        loadSchedulingData()
        break
      case "#history":
        loadCaseHistory()
        break
    }
  }

  function setupDocumentFilters() {
    const categoryButtons = document.querySelectorAll('input[name="docCategory"]')
    categoryButtons.forEach((button) => {
      button.addEventListener("change", function () {
        const category = this.id.replace("Docs", "").replace("all", "")
        filterDocuments(category)
      })
    })
  }

  function filterDocuments(category) {
    const documentCards = document.querySelectorAll(".document-card")

    documentCards.forEach((card) => {
      if (category === "" || card.getAttribute("data-category") === category) {
        card.style.display = "block"
        card.classList.add("fade-in")
      } else {
        card.style.display = "none"
      }
    })
  }

  function setupCommunicationFilters() {
    const filterButtons = document.querySelectorAll('input[name="commFilter"]')
    filterButtons.forEach((button) => {
      button.addEventListener("change", function () {
        const type = this.id.replace("Comm", "").replace("all", "")
        filterCommunication(type)
      })
    })
  }

  function filterCommunication(type) {
    const communicationItems = document.querySelectorAll(".communication-item")

    communicationItems.forEach((item) => {
      if (type === "" || item.getAttribute("data-type") === type) {
        item.style.display = "flex"
        item.classList.add("slide-in")
      } else {
        item.style.display = "none"
      }
    })
  }

  function initiateCall() {
    showAlert("Initiating call to +91 9876543210...", "info")

    // Simulate call connection
    setTimeout(() => {
      showAlert("Call connected. Click to end call.", "success")

      // Add call to communication log
      addCommunicationEntry({
        type: "call",
        status: "ongoing",
        timestamp: new Date(),
        duration: "00:00",
      })
    }, 2000)
  }

  function showSMSModal() {
    const modalHtml = `
      <div class="modal fade" id="smsModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Send SMS</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="smsForm">
                <div class="mb-3">
                  <label for="smsRecipient" class="form-label">Recipient</label>
                  <input type="text" class="form-control" id="smsRecipient" value="+91 9876543210" readonly>
                </div>
                <div class="mb-3">
                  <label for="smsTemplate" class="form-label">Template</label>
                  <select class="form-select" id="smsTemplate">
                    <option value="">Custom message</option>
                    <option value="appointment">Appointment reminder</option>
                    <option value="document">Document request</option>
                    <option value="status">Status update</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="smsMessage" class="form-label">Message</label>
                  <textarea class="form-control" id="smsMessage" rows="4" maxlength="160" placeholder="Enter your message..."></textarea>
                  <div class="form-text">
                    <span id="charCount">0</span>/160 characters
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" onclick="sendSMS()">
                <i class="fas fa-paper-plane me-2"></i>Send SMS
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    document.body.insertAdjacentHTML("beforeend", modalHtml)
    const modal = new bootstrap.Modal(document.getElementById("smsModal"))
    modal.show()

    // Setup character counter
    document.getElementById("smsMessage").addEventListener("input", function () {
      document.getElementById("charCount").textContent = this.value.length
    })
  }

  function showAddNoteModal() {
    const modalHtml = `
      <div class="modal fade" id="addNoteModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Add Case Note</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="addNoteForm">
                <div class="mb-3">
                  <label for="noteType" class="form-label">Note Type</label>
                  <select class="form-select" id="noteType">
                    <option value="general">General Note</option>
                    <option value="important">Important</option>
                    <option value="follow-up">Follow-up Required</option>
                    <option value="issue">Issue/Problem</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="noteContent" class="form-label">Note Content</label>
                  <textarea class="form-control" id="noteContent" rows="5" placeholder="Enter your note..."></textarea>
                </div>
                <div class="form-check mb-3">
                  <input class="form-check-input" type="checkbox" id="notifyTeam">
                  <label class="form-check-label" for="notifyTeam">
                    Notify team members about this note
                  </label>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" onclick="addCaseNote()">
                <i class="fas fa-save me-2"></i>Add Note
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    document.body.insertAdjacentHTML("beforeend", modalHtml)
    const modal = new bootstrap.Modal(document.getElementById("addNoteModal"))
    modal.show()
  }

  function handleDocumentUpload() {
    const input = document.createElement("input")
    input.type = "file"
    input.multiple = true
    input.accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx"

    input.onchange = (e) => {
      const files = Array.from(e.target.files)
      if (files.length > 0) {
        uploadDocuments(files)
      }
    }

    input.click()
  }

  function uploadDocuments(files) {
    files.forEach((file, index) => {
      setTimeout(() => {
        showAlert(`Uploading ${file.name}...`, "info")

        // Simulate upload progress
        setTimeout(
          () => {
            addDocumentToGrid(file)
            showAlert(`${file.name} uploaded successfully`, "success")
          },
          2000 + index * 1000,
        )
      }, index * 500)
    })
  }

  function addDocumentToGrid(file) {
    const documentsGrid = document.querySelector(".documents-grid")
    const fileIcon = getFileIcon(file.type)
    const fileCategory = getFileCategory(file.name)

    const documentCard = document.createElement("div")
    documentCard.className = "document-card fade-in"
    documentCard.setAttribute("data-category", fileCategory.toLowerCase())

    documentCard.innerHTML = `
      <div class="document-preview">
        <i class="${fileIcon} fa-3x"></i>
      </div>
      <div class="document-info">
        <h6 class="document-title">${file.name}</h6>
        <div class="document-meta">
          <span class="badge bg-info">${fileCategory}</span>
          <small class="text-muted">${formatFileSize(file.size)}</small>
        </div>
        <div class="document-details">
          <small class="text-muted">
            Uploaded by Current User<br>
            ${new Date().toLocaleString()}
          </small>
        </div>
        <div class="document-actions">
          <button class="btn btn-sm btn-outline-primary" onclick="previewDocument('${file.name}')">
            <i class="fas fa-eye"></i> Preview
          </button>
          <button class="btn btn-sm btn-outline-success" onclick="downloadDocument('${file.name}')">
            <i class="fas fa-download"></i> Download
          </button>
        </div>
      </div>
    `

    documentsGrid.appendChild(documentCard)
  }

  function getFileIcon(fileType) {
    if (fileType.includes("pdf")) return "fas fa-file-pdf text-danger"
    if (fileType.includes("image")) return "fas fa-file-image text-info"
    if (fileType.includes("word")) return "fas fa-file-word text-primary"
    return "fas fa-file text-secondary"
  }

  function getFileCategory(fileName) {
    const extension = fileName.split(".").pop().toLowerCase()
    if (["pdf", "doc", "docx"].includes(extension)) return "Document"
    if (["jpg", "jpeg", "png", "gif"].includes(extension)) return "Image"
    return "File"
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  function addCommunicationEntry(entry) {
    const timeline = document.querySelector(".communication-timeline")
    const entryHtml = `
      <div class="communication-item slide-in" data-type="${entry.type}">
        <div class="communication-icon bg-${entry.type === "call" ? "success" : "info"}">
          <i class="fas fa-${entry.type === "call" ? "phone" : "sms"}"></i>
        </div>
        <div class="communication-content">
          <div class="communication-header">
            <h6 class="mb-1">${entry.type === "call" ? "Ongoing Call" : "SMS"}</h6>
            <small class="text-muted">${entry.timestamp.toLocaleString()}</small>
          </div>
          <div class="communication-details">
            <p class="mb-2">${entry.type === "call" ? "Call in progress..." : "SMS sent"}</p>
            <div class="communication-meta">
              <span class="badge bg-${entry.status === "ongoing" ? "warning" : "success"}">${entry.status}</span>
              ${entry.duration ? `<small class="text-muted ms-2">Duration: ${entry.duration}</small>` : ""}
            </div>
          </div>
        </div>
      </div>
    `

    timeline.insertAdjacentHTML("afterbegin", entryHtml)
  }

  function setupRealTimeFeatures() {
    // Simulate real-time updates
    setInterval(() => {
      updateCaseProgress()
      updateOnlineStatus()
    }, 30000)
  }

  function updateCaseProgress() {
    const progressBar = document.querySelector(".progress-bar")
    if (progressBar) {
      const currentProgress = Number.parseInt(progressBar.style.width)
      if (currentProgress < 100 && Math.random() > 0.7) {
        const newProgress = Math.min(currentProgress + 5, 100)
        progressBar.style.width = `${newProgress}%`

        const progressText = document.querySelector(".progress-info small:last-child")
        if (progressText) {
          progressText.textContent = `${newProgress}% Complete`
        }
      }
    }
  }

  function updateOnlineStatus() {
    const statusElements = document.querySelectorAll(".text-success, .text-warning")
    statusElements.forEach((element) => {
      if (element.textContent.includes("Online") || element.textContent.includes("Away")) {
        // Randomly update status
        if (Math.random() > 0.8) {
          const isOnline = Math.random() > 0.5
          element.innerHTML = isOnline
            ? '<i class="fas fa-circle me-1" style="font-size: 0.5rem;"></i>Online'
            : '<i class="fas fa-circle me-1" style="font-size: 0.5rem;"></i>Away'
          element.className = isOnline ? "text-success" : "text-warning"
        }
      }
    })
  }

  function loadCaseData() {
    // Simulate loading case data
    console.log("Loading enhanced case data...")
  }

  function loadDocuments() {
    // Simulate loading documents
    console.log("Loading documents...")
  }

  function loadCommunicationHistory() {
    // Simulate loading communication history
    console.log("Loading communication history...")
  }

  function loadSchedulingData() {
    // Simulate loading scheduling data
    console.log("Loading scheduling data...")
  }

  function loadCaseHistory() {
    // Simulate loading case history
    console.log("Loading case history...")
  }

  function startRealTimeUpdates() {
    // Start real-time updates
    console.log("Starting real-time updates...")
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
    const form = document.getElementById("scheduleVMERForm")
    if (form.checkValidity()) {
      showAlert("VMER appointment scheduled successfully!", "success")
      const modal = bootstrap.Modal.getInstance(document.getElementById("scheduleVMERModal"))
      modal.hide()
    } else {
      showAlert("Please fill in all required fields", "warning")
    }
  }

  window.sendSMS = () => {
    const message = document.getElementById("smsMessage").value
    if (message.trim()) {
      showAlert("SMS sent successfully!", "success")
      const modal = bootstrap.Modal.getInstance(document.getElementById("smsModal"))
      modal.hide()
    } else {
      showAlert("Please enter a message", "warning")
    }
  }

  window.addCaseNote = () => {
    const content = document.getElementById("noteContent").value
    if (content.trim()) {
      showAlert("Note added successfully!", "success")
      const modal = bootstrap.Modal.getInstance(document.getElementById("addNoteModal"))
      modal.hide()
    } else {
      showAlert("Please enter note content", "warning")
    }
  }

  window.previewDocument = (filename) => {
    const modal = new bootstrap.Modal(document.getElementById("documentPreviewModal"))
    modal.show()

    // Simulate document loading
    setTimeout(() => {
      const previewContent = document.getElementById("documentPreviewContent")
      previewContent.innerHTML = `
        <div class="text-center">
          <i class="fas fa-file-alt fa-5x text-muted mb-3"></i>
          <h5>Document Preview</h5>
          <p class="text-muted">${filename}</p>
          <p class="small">Preview functionality would be implemented here</p>
        </div>
      `
    }, 1000)
  }

  window.downloadDocument = (filename) => {
    showAlert(`Downloading ${filename}...`, "info")

    // Simulate download
    setTimeout(() => {
      showAlert(`${filename} downloaded successfully!`, "success")
    }, 2000)
  }

  window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showAlert("Copied to clipboard!", "success")
    })
  }

  // Declare variables for case action handlers
  const handleShareCase = () => {
    showAlert("Case shared successfully!", "success")
  }

  const handleDuplicateCase = () => {
    showAlert("Case duplicated successfully!", "success")
  }

  const handleExportCase = () => {
    showAlert("Case exported successfully!", "success")
  }

  const handleArchiveCase = () => {
    showAlert("Case archived successfully!", "success")
  }

  const handleChangePriority = () => {
    showAlert("Priority changed successfully!", "success")
  }

  const handleReassignCase = () => {
    showAlert("Case reassigned successfully!", "success")
  }

  const handleEscalateCase = () => {
    showAlert("Case escalated successfully!", "success")
  }
})
