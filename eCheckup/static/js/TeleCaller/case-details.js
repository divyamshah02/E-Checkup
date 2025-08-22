let case_detail_url = null
let staff_list_url = null
let assign_url = null
let appointment_url = null
let csrf_token = null
let caseId = null
let caseData = null
let dc_vmerData = null


async function InitializeCaseDetails(csrf_token_param, case_detail_url_param, staff_list_url_param, assign_url_param, appointment_url_param, case_id_param) {
  csrf_token = csrf_token_param
  case_detail_url = case_detail_url_param
  staff_list_url = staff_list_url_param
  assign_url = assign_url_param
  appointment_url = appointment_url_param
  caseId = case_id_param

  await fetchCaseDetails()

  if (caseData) {
      await populateHeader()
      await generateTimeline()
      await populateDocuments()
      await populateActions()
      await addEventListeners()
      await populateDcVmer()
      await manageStatus()
      await populatePastSchedules()
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

async function populateHeader() {
  document.getElementById("case-id-header").textContent = `Case Details: ${caseData.case_id}`
  // document.getElementById("breadcrumb-case-id").textContent = caseData.caseId
  // document.getElementById("case-id-title").textContent = caseData.case_id
  document.getElementById("policy-number").textContent = caseData.policy_number
  document.getElementById("policy-holder-name").textContent = caseData.holder_name
  document.getElementById("policy-sum-assured").textContent = caseData.sum_assured
  document.getElementById("policy-holder-number").textContent = caseData.holder_phone
  document.getElementById("policy-holder-email").textContent = caseData.holder_email
  document.getElementById("policy-type").textContent = caseData.policy_type.toString().toUpperCase()
  document.getElementById("payment-method").textContent = caseData.payment_method.toString().toUpperCase()

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

async function generateTimeline() {
  case_logs = caseData.case_logs
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
    "vmer": [
      // { stage: "Case Created", user: "HOD" },
      { stage: "Assigned to Telecaller", user: "Coordinator" },
      { stage: "Schedule Created", user: "Tele-caller" },
      { stage: "ReSchedule Created", user: "Tele-caller" },
      { stage: "Assigned to VMER Med Co", user: "Tele-caller" },
      { stage: "Video recording uploaded by VMER Med Co", user: "VMER Med Co" },
      { stage: "Case Submitted to LIC", user: "Coordinator" },
    ],
    "dc_visit": [
      // { stage: "Case Created", user: "HOD" },
      { stage: "Assigned to Telecaller", user: "Coordinator" },
      { stage: "Schedule Created", user: "Tele-caller" },
      { stage: "ReSchedule Created", user: "Tele-caller" },
      { stage: "Assigned to Diagnostic Center", user: "Tele-caller" },
      { stage: "Diagnostic report uploaded by DC", user: "DC" },
      { stage: "Case Submitted to LIC", user: "Coordinator" },
    ],
    "online": [
      // { stage: "Case Created", user: "HOD" },
      { stage: "Assigned to Telecaller", user: "Coordinator" },
      { stage: "Schedule Created", user: "Tele-caller" },
      { stage: "ReSchedule Created", user: "Tele-caller" },
      { stage: "Assigned to VMER Med Co", user: "Tele-caller" },
      { stage: "Video recording uploaded by VMER Med Co", user: "VMER Med Co" },
      { stage: "Case Submitted to LIC", user: "Coordinator" },
    ],
    "both": [
      // { stage: "Case Created", user: "HOD" },
      { stage: "Assigned to Telecaller", user: "Coordinator" },
      { stage: "Schedule Created", user: "Tele-caller" },
      { stage: "ReSchedule Created", user: "Tele-caller" },
      { stage: "Assigned to VMER Med Co", user: "Tele-caller" },
      { stage: "Video recording uploaded by VMER Med Co", user: "VMER Med Co" },
      { stage: "Assigned to Diagnostic Center", user: "Tele-caller" },
      { stage: "Diagnostic report uploaded by DC", user: "DC" },
      { stage: "Case Submitted to LIC", user: "Coordinator" },
    ],
  }

  const stages = stagesByCaseType[caseData.case_type] || []

  // Helper to match case log to a stage
  const matchLogToStage = (stageLabel) => {
    return case_logs.find(log => {
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
      console.log(log)
      if (log.action.includes('Assigned to Telecaller')) {
        stage_action = 'Assigned to You'
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
      icon: getIcon(item.stage)
    }
  })

  timelineContainer.innerHTML = timelineItems
    .map((item) => {
      let itemClass = item.status
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
  
  let text_content = ''
  let documents = []
  let is_report_uploaded = false
  if (caseData.video_url) {
    documents = [caseData.video_url]
    text_content = 'VMER Recoding'
    is_report_uploaded = true
  }
  if (caseData.report_url) {
    documents = [caseData.report_url]
    text_content = 'Report'
    is_report_uploaded = true
  }
  
}

async function populateActions() {
  const dcVmerSelect = document.getElementById("dc_vmer-select")
  await fetchDcVmer()
  dc_vmerData.forEach((tc) => {
    const option = document.createElement("option")
    option.value = tc.user_id
    option.textContent = tc.name
    dcVmerSelect.appendChild(option)
  })
  if (caseData.case_type == 'dc_visit'){
    if (caseData.assigned_dc_id) {
      dcVmerSelect.value = caseData.assigned_dc_id
    }
  }
  else if (caseData.case_type == 'both'){
    if (caseData.case_stage == 'dc_visit'){
        if (caseData.assigned_dc_id) {
        dcVmerSelect.value = caseData.assigned_dc_id
      }
    }
    else if (caseData.case_stage == 'vmer'){
      if (caseData.assigned_vmer_med_co_id) {
        dcVmerSelect.value = caseData.assigned_vmer_med_co_id
      }
    }
  }
  else{
    if (caseData.assigned_vmer_med_co_id) {
      dcVmerSelect.value = caseData.assigned_vmer_med_co_id
    }
  }

  if (caseData.active_schedule) {
      document.getElementById('appointment-datetime').value = caseData.active_schedule
    }

}

async function populateDcVmer() {
  if (caseData.case_type == 'dc_visit') {
    if (caseData.assigned_dc_id) {
      document.getElementById("dc-name").textContent = caseData.assigned_dc.dc_name
      document.getElementById("dc-address").textContent = caseData.assigned_dc.dc_address
      document.getElementById("dc-city").textContent = caseData.assigned_dc.dc_city
      document.getElementById("dc-state").textContent = caseData.assigned_dc.dc_state
      document.getElementById("dc-pincode").textContent = caseData.assigned_dc.dc_pincode
    }
    else {
      document.getElementById('dc_details').style.display = 'none'
    }

  }
  else if (caseData.case_type == 'both'){
    if (caseData.assigned_vmer_med_co_id) {
      document.getElementById("vmer-med-co-name").textContent = caseData.assigned_vmer_med_co.name
      document.getElementById("vmer-med-co-email").textContent = caseData.assigned_vmer_med_co.email
    }
    else {
      document.getElementById('vmer_med_co_details').style.display = 'none'
    }
    console.log(caseData.assigned_dc_id)
    if (caseData.assigned_dc_id) {
      document.getElementById("dc-name").textContent = caseData.assigned_dc.dc_name
      document.getElementById("dc-address").textContent = caseData.assigned_dc.dc_address
      document.getElementById("dc-city").textContent = caseData.assigned_dc.dc_city
      document.getElementById("dc-state").textContent = caseData.assigned_dc.dc_state
      document.getElementById("dc-pincode").textContent = caseData.assigned_dc.dc_pincode
    }
    else {
      document.getElementById('dc_details').style.display = 'none'
    }
  }
  else {
    if (caseData.assigned_vmer_med_co_id) {
      document.getElementById("vmer-med-co-name").textContent = caseData.assigned_vmer_med_co.name
      document.getElementById("vmer-med-co-email").textContent = caseData.assigned_vmer_med_co.email
    }
    else {
      document.getElementById('vmer_med_co_details').style.display = 'none'
    }
  }
}

async function fetchDcVmer() {
  let role = ''
  if (caseData.case_type == 'dc_visit'){
    role = 'diagnostic_center'
  }
  else if (caseData.case_type == 'both'){
    if (caseData.case_stage == 'dc_visit'){
      role = 'diagnostic_center'
    }
    else {
      role = 'vmer_med_co'
    }
  }
  else {
    role = 'vmer_med_co'
  }
  const fullUrl = `${staff_list_url}?role=${role}`
  const [success, result] = await callApi("GET", fullUrl)

  if (success && result.success) {
    dc_vmerData = result.data  
    
  } else {
    console.error("Failed to load telecaller data:", result.error)
    dc_vmerData = null
  }
}

async function addEventListeners() {
  const assignBtn = document.getElementById("assign-dc_vmer-btn")
  if (assignBtn) {
    assignBtn.addEventListener("click", async () => {
      const selected = document.getElementById("dc_vmer-select").value
      if (selected !== "Choose...") {
        await assignDcVmer(selected);        
      } else {
        alert("Please select a user.")
      }
    })
  }

  const sendBtn = document.getElementById("send-to-lic-btn")
  if (sendBtn) {
    sendBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to mark this case as sent to LIC? This action cannot be undone.")) {
        alert("Case marked as sent to LIC.")
      }
    })
  }
}

async function assignDcVmer(selected_dc_vmer) {
  let role = ''
  if (caseData.case_type == 'dc_visit'){
    role = 'diagnostic_center'
  }
  else if (caseData.case_type == 'both'){
    if (caseData.case_stage == 'dc_visit'){
      role = 'diagnostic_center'
    }
    else {
      role = 'vmer_med_co'
    }
  }
  else {
    role = 'vmer_med_co'
  }
  const fullUrl = assign_url
  const bodyData = {
    case_id : caseId,
    role : role,
    assign_to : selected_dc_vmer,
  }
  const [success, result] = await callApi("POST", fullUrl, bodyData, csrf_token)
  if (success && result.success) {
    alert("Assigned successfully!")
    location.reload();    
    
  } else {
    console.error("Failed to load telecaller data:", result.error)    
    alert(`Unable to assign: ${result.error}`)
    location.reload();
  }
}

async function scheduleAppointment() {
  let dt = document.getElementById('appointment-datetime').value
  if (dt=='') {
    alert('Please select date & time of appointment')
    return
  }
  
  let dtFormatted = dt.replace('T', ':00 ').replace(':', ':');
  dtFormatted = dt.replace('T', ' ') + ':00';

  console.log(dtFormatted);  // Output: "2025-07-27 19:15:00"
  const fullUrl = appointment_url  
  const bodyData = {
    case_id : caseId,
    schedule_time: dtFormatted    
  }
  const [success, result] = await callApi("POST", fullUrl, bodyData, csrf_token)
  if (success && result.success) {
    alert("Appointment Scheduled!")
    location.reload();    
    
  } else {
    console.error("Failed to load telecaller data:", result.error)    
    alert(`Unable to schedule an appointment : ${result.error}`)
    location.reload();
  }
}

async function manageStatus() {
  let case_status = caseData.status
  let assign_btn = document.getElementById('assign-dc_vmer-btn')
  let schedule_btn = document.getElementById('schedule-visit-call')

  if (case_status == 'uploaded' || case_status == 'submitted_to_lic' || case_status == 'completed') {
    assign_btn.disabled = true
    schedule_btn.disabled = true
  }
  if (case_status == 'scheduled' || case_status == 'rescheduled') {
    assign_btn.textContent = 'ReAssign'
    assign_btn.disabled = false
    schedule_btn.textContent = 'ReSchedule'
    schedule_btn.disabled = false
  }
  if (case_status == 'assigned') {
    assign_btn.textContent = 'Assign'
    assign_btn.disabled = false
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

async function getCaseTypeInfo(caseType) {
  switch (caseType) {
    case "VMER":
      return { color: "info" }
    case "DC Visit":
      return { color: "success" }
    case "Online":
      return { color: "primary" }
    default:
      return { color: "secondary" }
  }
}

function getTypeInfo(type) {
  const typeMap = {
    vmer: { color: "primary", label: "VMER" },
    dc_visit: { color: "primary", label: "DC Visit" },
    online: { color: "primary", label: "Online" },
    both: { color: "primary", label: "Both" },
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
                        <th>Schedule Type</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${caseData.schedule_logs
                      .map(
                        (s) => `
                        <tr>
                            <td>${new Date(s.schedule_time).toLocaleString()}</td>
                            <td>${s.schedule_type}</td>
                            <td><span class="badge bg-info-soft text-info">${s.is_active ? 'Active' : 'Old'}</span></td>                            
                        </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>
        </div>
    `
  }
