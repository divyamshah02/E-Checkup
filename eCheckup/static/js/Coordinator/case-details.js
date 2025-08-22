let case_detail_url = null
let staff_list_url = null
let assign_url = null
let csrf_token = null
let caseId = null
let caseData = null
let telecallerData = null


async function InitializeCaseDetails(csrf_token_param, case_detail_url_param, staff_list_url_param, assign_url_param, case_id_param) {
  csrf_token = csrf_token_param
  case_detail_url = case_detail_url_param
  staff_list_url = staff_list_url_param
  assign_url = assign_url_param
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
      { stage: "Case Created", user: "HOD" },
      { stage: "Assigned to Telecaller", user: "Coordinator" },
      { stage: "Schedule Created", user: "Tele-caller" },
      { stage: "ReSchedule Created", user: "Tele-caller" },
      { stage: "Assigned to VMER Med Co", user: "Tele-caller" },
      { stage: "Video recording uploaded by VMER Med Co", user: "VMER Med Co" },
      { stage: "Case Submitted to LIC", user: "Coordinator" },
    ],
    "dc_visit": [
      { stage: "Case Created", user: "HOD" },
      { stage: "Assigned to Telecaller", user: "Coordinator" },
      { stage: "Schedule Created", user: "Tele-caller" },
      { stage: "ReSchedule Created", user: "Tele-caller" },
      { stage: "Assigned to Diagnostic Center", user: "Tele-caller" },
      { stage: "Diagnostic report uploaded by DC", user: "DC" },
      { stage: "Case Submitted to LIC", user: "Coordinator" },
    ],
    "online": [
      { stage: "Case Created", user: "HOD" },
      { stage: "Assigned to Telecaller", user: "Coordinator" },
      { stage: "Schedule Created", user: "Tele-caller" },
      { stage: "ReSchedule Created", user: "Tele-caller" },
      { stage: "Assigned to VMER Med Co", user: "Tele-caller" },
      { stage: "Video recording uploaded by VMER Med Co", user: "VMER Med Co" },
      { stage: "Case Submitted to LIC", user: "Coordinator" },
    ],
    "both": [
      { stage: "Case Created", user: "HOD" },
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

async function populateDocuments_old() {
  const container = document.getElementById("view-reports-section")
  if (!container) return

  if (caseData.documents && caseData.documents.length > 0) {
    container.innerHTML = caseData.documents
      .map(
        (doc) => `
            <a href="#" class="document-link" onclick="alert('Viewing ${doc.name}')">
                <i class="fas fa-file-alt text-primary"></i>
                <div>
                    <div class="fw-semibold">${doc.name}</div>
                    <div class="text-muted small">Uploaded on: ${doc.uploadedOn}</div>
                </div>
            </a>
        `,
      )
      .join("")
  } else {
    let message = "No documents have been uploaded by the tele-caller yet."
    if (caseData.caseType === "VMER") message = "No video has been uploaded by the tele-caller yet."
    if (caseData.caseType === "DC Visit") message = "No reports have been uploaded by the tele-caller yet."
    container.innerHTML = `<p class="text-muted small">${message}</p>`
  }
}

async function populateDocuments() {
  const container = document.getElementById("view-reports-section")
  
  let text_content = []
  let documents = []

  let is_report_uploaded = false
  if (caseData.video_url) {
    documents.push(caseData.video_url)
    text_content.push('VMER_Recording.mp4')
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

async function populateActions() {
  const telecallerSelect = document.getElementById("telecaller-select")
  await fetchTelecallers()
  telecallerData.forEach((tc) => {
    const option = document.createElement("option")
    option.value = tc.user_id
    option.textContent = tc.name
    telecallerSelect.appendChild(option)
  })
  if (caseData.assigned_telecaller_id) {
    telecallerSelect.value = caseData.assigned_telecaller_id
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
      document.getElementById('vmer_med_co_details').style.display = 'none'

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

async function fetchTelecallers() {
  const fullUrl = `${staff_list_url}?role=telecaller`
  const [success, result] = await callApi("GET", fullUrl)

  if (success && result.success) {
    telecallerData = result.data  
    
  } else {
    console.error("Failed to load telecaller data:", result.error)
    telecallerData = null
  }
}

async function addEventListeners() {
  const assignBtn = document.getElementById("assign-telecaller-btn")
  if (assignBtn) {
    assignBtn.addEventListener("click", async () => {
      const selected = document.getElementById("telecaller-select").value
      if (selected !== "Choose...") {
        await assignTelecaller(selected);        
      } else {
        alert("Please select a tele-caller.")
      }
    })
  }

  const sendBtn = document.getElementById("send-to-lic-btn")
  if (sendBtn) {
    sendBtn.addEventListener("click", async () => {
      if (confirm("Are you sure you want to mark this case as sent to LIC? This action cannot be undone.")) {
        await send_to_lic() 
      }
    })
  }
}

async function send_to_lic() {
  const fullUrl = `${case_detail_url}${caseData.case_id}/`
  const bodyData = {
    case_id: caseData.case_id,
    status: 'submitted_to_lic',
  }
  const [success, result] = await callApi("PUT", fullUrl, bodyData, csrf_token)
  if (success && result.success) {
    alert("Case marked as sent to LIC.")
    location.reload();    
    
  } else {
    console.error("Failed to load telecaller data:", result.error)    
    alert(`Unable to sned case to LIC: ${result.error}`)
    
  }
}

async function assignTelecaller(selected_telecaller) {
  const fullUrl = assign_url
  const bodyData = {
    case_id : caseId,
    role : 'telecaller',
    assign_to : selected_telecaller,
  }
  const [success, result] = await callApi("POST", fullUrl, bodyData, csrf_token)
  if (success && result.success) {
    alert("Tele-caller assigned successfully!")
    location.reload();    
    
  } else {
    console.error("Failed to load telecaller data:", result.error)    
    alert(`Unable to assign tele-caller: ${result.error}`)
    location.reload();
  }
}

async function manageStatus() {
  let case_status = caseData.status
  let assign_btn = document.getElementById('assign-telecaller-btn')
  let send_to_lic_btn = document.getElementById('send-to-lic-btn')

  if (case_status == 'submitted_to_lic' || case_status == 'completed') {
    assign_btn.disabled = true
    send_to_lic_btn.disabled = true
  }
  if (case_status == 'uploaded') {
    document.getElementById('submit-to-lic-sec').style.display = ''
    assign_btn.disabled = true

  }
  if (case_status == 'scheduled' || case_status == 'rescheduled') {
    assign_btn.textContent = 'ReAssign'
    assign_btn.disabled = true
  }
  if (case_status == 'assigned') {
    assign_btn.textContent = 'ReAssign'
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
                            <div class="ms-auto"><a class="fa fa-download fa-xl mx-2 text-white" href="${doc}" download="${String(doc).replace('https://sankievents.s3.eu-north-1.amazonaws.com/uploads/', '')}" id="doc-${doc_index}-downloader"></a></div>
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
