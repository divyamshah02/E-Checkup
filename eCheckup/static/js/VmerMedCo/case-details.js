let case_detail_url = null
let staff_list_url = null
let assign_url = null
let appointment_url = null
let case_issue_url = null
let case_document_upload_url = null
let csrf_token = null
let caseId = null
let caseData = null
let currentReasonAction = null

async function InitializeCaseDetails(
  csrf_token_param,
  case_detail_url_param,
  staff_list_url_param,
  assign_url_param,
  appointment_url_param,
  case_issue_url_param,
  case_document_upload_url_param,
  case_id_param,
) {
  csrf_token = csrf_token_param
  case_detail_url = case_detail_url_param
  staff_list_url = staff_list_url_param
  assign_url = assign_url_param
  appointment_url = appointment_url_param
  case_issue_url = case_issue_url_param
  case_document_upload_url = case_document_upload_url_param
  caseId = case_id_param

  await fetchCaseDetails()

  if (caseData) {
    await populateHeader()
    await generateTimeline()
    await populateDocuments()
    await addEventListeners()
    await manageStatus()
    await populatePastSchedules() // Call populatePastSchedules function
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
  const [success, result] = await window.callApi("GET", fullUrl) // Declare callApi variable

  if (success && result.success) {
    caseData = result.data
  } else {
    console.error("Failed to load case details:", result.error)
    caseData = null
  }
}

async function populateHeader() {
  document.getElementById("case-id-header").textContent = `Case Details: ${caseData.case_id}`
  document.getElementById("policy-number").textContent = caseData.policy_number
  document.getElementById("policy-holder-name").textContent = caseData.holder_name
  document.getElementById("policy-sum-assured").textContent = caseData.sum_assured
  document.getElementById("policy-holder-number").textContent = caseData.holder_phone
  document.getElementById("policy-holder-email").textContent = caseData.holder_email
  document.getElementById("policy-type").textContent = caseData.policy_type.toString().toUpperCase()
  document.getElementById("visit-schedule").textContent = formatScheduleDate(caseData.active_schedule)

  document.getElementById("holder-dob").textContent = caseData.holder_dob || "Not provided"
  document.getElementById("holder-gender").textContent = caseData.holder_gender || "Not provided"
  document.getElementById("holder-address").textContent = caseData.holder_address || "Not provided"
  document.getElementById("holder-state").textContent = caseData.holder_state || "Not provided"
  document.getElementById("holder-city").textContent = caseData.holder_city || "Not provided"
  document.getElementById("holder-pincode").textContent = caseData.holder_pincode || "Not provided"

  const badgesContainer = document.getElementById("case-badges")
  const caseTypeInfo = getTypeInfo(caseData.case_type)
  const statusInfo = getStatusInfo(caseData.status)
  const priorityInfo = getPriorityInfo(caseData.priority)

  badgesContainer.innerHTML = `
        <span class="badge bg-${caseTypeInfo.color}">${caseTypeInfo.label}</span>
        <span class="badge rounded-pill bg-${statusInfo.color}">${caseData.status}</span>
        <span class="badge bg-${priorityInfo.color}">${caseData.priority}</span>
    `
}

function formatScheduleDate(dateString) {
  const date = new Date(dateString)

  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  const day = date.getDate()
  const month = date.toLocaleString("default", { month: "long" })
  const year = date.getFullYear()

  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th"

  return `${hours}:${minutes} - ${day}${suffix} ${month}, ${year}`
}

async function generateTimeline() {
  const timelineContainer = document.getElementById("case-timeline")
  if (!timelineContainer) return

  const getIcon = (stage) => {
    const icons = {
      "Case Created": "fa-plus-circle",
      "Assigned to You": "fa-user-check",
      "Assigned to Telecaller": "fa-headset",
      "Schedule Created": "fa-calendar-alt",
      "Assigned to VMER Med Co": "fa-video",
      "Video recording uploaded by VMER Med Co": "fa-file-upload",
      "Assigned to Diagnostic Center": "fa-hospital-user",
      "Diagnostic report uploaded by DC": "fa-file-upload",
      "Case Submitted to LIC": "fa-paper-plane",
    }
    return icons[stage] || "fa-tasks"
  }

  const stagesByCaseType = {
    vmer: [
      { stage: "Assigned to VMER Med Co", user: "Tele-caller" },
      { stage: "Video recording uploaded by VMER Med Co", user: "VMER Med Co" },
      { stage: "Case Submitted to LIC", user: "Coordinator" },
    ],
    both: [
      { stage: "Assigned to VMER Med Co", user: "Tele-caller" },
      { stage: "Video recording uploaded by VMER Med Co", user: "VMER Med Co" },
      { stage: "Case Submitted to LIC", user: "Coordinator" },
    ],
    dc_visit: [
      { stage: "Assigned to Diagnostic Center", user: "Tele-caller" },
      { stage: "Diagnostic report uploaded by DC", user: "DC" },
      { stage: "Case Submitted to LIC", user: "Coordinator" },
    ],
    online: [
      { stage: "Assigned to VMER Med Co", user: "Tele-caller" },
      { stage: "Video recording uploaded by VMER Med Co", user: "VMER Med Co" },
      { stage: "Case Submitted to LIC", user: "Coordinator" },
    ],
  }

  const stages = stagesByCaseType[caseData.case_type] || []

  const matchLogToStage = (stageLabel) => {
    return caseData.case_logs.find((log) => {
      const normalizedAction = log.action.toLowerCase()
      const normalizedStage = stageLabel.toLowerCase()
      return normalizedAction.includes(normalizedStage) || normalizedStage.includes(normalizedAction)
    })
  }

  let lastCompletedIndex = -1
  const timelineItems = stages.map((item, index) => {
    const log = matchLogToStage(item.stage)
    let status = "pending"
    let notes = `Awaiting ${item.stage.toLowerCase()}.`

    if (log) {
      let stage_action = log.action
      if (log.action.includes("Assigned to Diagnostic Center")) {
        stage_action = "Assigned to You"
      }
      item.stage = stage_action
      status = "completed"
      notes = `${log.action} by ${log.action_by_name} (${log.action_by_role}) on ${log.timestamp}`
      lastCompletedIndex = index
    } else if (index === lastCompletedIndex + 1) {
      status = "in-progress"
    }

    return {
      ...item,
      status,
      notes,
      icon: getIcon(item.stage),
    }
  })

  timelineContainer.innerHTML = timelineItems
    .map((item) => {
      const itemClass = item.status
      return `
        <div class="timeline-item ${itemClass}">
          <div class="timeline-icon">
            <i class="fas ${item.icon}"></i>
          </div>
          <div class="timeline-content">
            <h6>${item.stage}</h6>
            <p class="mb-1">${item.notes}</p>
            <div class="timeline-meta">
              <span>Responsible: ${item.user}</span>
            </div>
          </div>
        </div>
      `
    })
    .join("")
}

async function populateDocuments() {
  const container = document.getElementById("view-reports-section")

  let text_content = ""
  let documents = []
  let is_report_uploaded = false
  if (caseData.video_url) {
    documents = [caseData.video_url]
    text_content = "VMER Recoding"
    is_report_uploaded = true
  }
  if (caseData.report_url) {
    documents = [caseData.report_url]
    text_content = "Report"
    is_report_uploaded = true
  }
}

async function addEventListeners() {
  // Upload Report button
  const uploadBtn = document.getElementById("upload-report-btn")
  const fileInput = document.getElementById("report-file-input")
  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener("click", () => {
      fileInput.click()
    })

    fileInput.addEventListener("change", async (event) => {
      const file = event.target.files[0]
      if (file) {
        console.log("File selected:", file.name)
        // alert(`File "${file.name}" selected for upload.`)
        if (confirm(`Upload File "${file.name}"?`)) {
          const formData = new FormData()
          formData.append(`file`, file)
          formData.append(`case_id`, caseData.case_id)
          const url = case_document_upload_url
          const [success, result] = await window.callApi("POST", url, formData, csrf_token, true)

          if (success && result.success) {
            location.reload()
          } else {
            console.error("Failed to upload document: ", result.error)
          }
        }
        // Here you would typically handle the file upload process
      }
    })
  }

  // Didn't Visit button
  const didntVisitBtn = document.getElementById("didnt-visit-btn")
  if (didntVisitBtn) {
    didntVisitBtn.addEventListener("click", () => {
      currentReasonAction = "didnt-visit"
      const modal = new bootstrap.Modal(document.getElementById("reasonModal"))
      document.getElementById("reasonModalLabel").textContent = "Didn't Visit - Provide Reason"
      modal.show()
    })
  }

  // Issue While Test button
  const issueWhileTestBtn = document.getElementById("issue-while-test-btn")
  if (issueWhileTestBtn) {
    issueWhileTestBtn.addEventListener("click", () => {
      currentReasonAction = "issue-while-test"
      const modal = new bootstrap.Modal(document.getElementById("reasonModal"))
      document.getElementById("reasonModalLabel").textContent = "Issue While Test - Provide Reason"
      modal.show()
    })
  }

  // Submit Reason button
  const submitReasonBtn = document.getElementById("submitReasonBtn")
  if (submitReasonBtn) {
    submitReasonBtn.addEventListener("click", async () => {
      const reason = document.getElementById("reasonText").value.trim()
      if (reason) {
        await handleReasonSubmission(currentReasonAction, reason)
        const modal = bootstrap.Modal.getInstance(document.getElementById("reasonModal"))
        modal.hide()
        document.getElementById("reasonText").value = ""
      } else {
        alert("Please provide a reason.")
      }
    })
  }
}

async function handleReasonSubmission(action, reason) {
  console.log(`Action: ${action}, Reason: ${reason}`)

  if (action === "didnt-visit") {
    await recordIssue("customer_not_visited", reason)
    alert(`Didn't Visit reason recorded: ${reason}`)
    // Here you would make an API call to record the "didn't visit" status
  } else if (action === "issue-while-test") {
    await recordIssue("test_issue", reason)
    alert(`Issue While Test reason recorded: ${reason}`)
    // Here you would make an API call to record the issue
  }
}

async function recordIssue(issue_type, reason) {
  const fullUrl = case_issue_url
  const bodyData = {
    case_id: caseData.case_id,
    issue_type: issue_type,
    reason: reason,
  }
  const [success, result] = await window.callApi("POST", fullUrl, bodyData, csrf_token)
  if (success && result.success) {
    location.reload()
    caseData = result.data
  } else {
    console.error("Failed to load case details:", result.error)
    caseData = null
  }
}

async function manageStatus() {
  const case_status = caseData.status
  const uploadBtn = document.getElementById("upload-report-btn")
  const didntVisitBtn = document.getElementById("didnt-visit-btn")
  const issueBtn = document.getElementById("issue-while-test-btn")

  if (
    case_status == "issue" ||
    case_status == "uploaded" ||
    case_status == "submitted_to_lic" ||
    case_status == "completed"
  ) {
    uploadBtn.disabled = true
    didntVisitBtn.disabled = true
    issueBtn.disabled = true
  }

  if (case_status == "issue") {
    const issue_div = document.getElementById("issue-div")
    issue_div.style.display = ""
    const issue_type = caseData.issue_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    issue_div.textContent = `You have raised an issue : ${issue_type} - ${caseData.issue_reason}`
  }
}

function getStatusInfo(status) {
  switch (status) {
    case "completed":
      return { color: "success" }
    case "submitted_to_lic":
      return { color: "success" }
    case "rescheduled":
      return { color: "warning" }
    case "cancelled":
      return { color: "danger" }
    case "scheduled":
      return { color: "primary" }
    case "issue":
      return { color: "danger" }
    default:
      return { color: "secondary" }
  }
}

function getPriorityInfo(priority) {
  switch (priority.toLowerCase()) {
    case "urgent":
      return { color: "danger" }
    case "high":
      return { color: "warning" }
    case "normal":
      return { color: "primary" }
    default:
      return { color: "secondary" }
  }
}

function getTypeInfo(type) {
  const typeMap = {
    vmer: { color: "primary", label: "VMER" },
    dc_visit: { color: "primary", label: "DC Visit" },
    both: { color: "primary", label: "BOTH" },
    online: { color: "primary", label: "Online" },
  }
  return typeMap[type] || { color: "secondary", label: "Unknown" }
}

async function populatePastSchedules() {
  const container = document.getElementById("past-schedules")
  if (!container) return

  if (!caseData.schedule_logs || caseData.schedule_logs.length === 0) {
    container.innerHTML = '<p class="text-muted">No appointments have been scheduled for this case yet.</p>'
    return
  }

  container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${caseData.schedule_logs
                      .map(
                        (s) => `
                        <tr>
                            <td>${new Date(s.schedule_time).toLocaleString()}</td>
                            <td><span class="badge bg-info-soft text-info">${s.is_active ? "Active" : "Old"}</span></td>                            
                        </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>
        </div>
    `
}
