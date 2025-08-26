// Declare the callApi function or import it before using it
function callApi(method, url, body, csrfToken) {
  // Placeholder implementation for callApi
  return new Promise((resolve) => {
    resolve([true, { success: true, data: {} }])
  })
}

async function InitializeCaseDetails(csrfToken, apiUrl, caseId) {
  const fullUrl = `${apiUrl}${caseId}/`
  const [success, result] = await callApi("GET", fullUrl, null, csrfToken)

  if (success && result.success) {
    populateCaseDetails(result.data)
  } else {
    console.error("Failed to load case details:", result.error)
    document.querySelector("main").innerHTML = `
            <div class="alert alert-danger">
                Could not load case details for ID: ${caseId}. 
                ${result.error || "Please try again later."}
            </div>`
  }
}

function populateCaseDetails(data) {
  // --- Helper Functions for Badges ---
  const getStatusBadge = (status) => {
    const statusMap = {
      created: { class: "bg-warning", text: "Pending" },
      assigned: { class: "bg-primary", text: "In Progress" },
      scheduled: { class: "bg-info", text: "Scheduled" },
      submitted_to_lic: { class: "bg-success", text: "Completed" },
      completed: { class: "bg-success", text: "Finished" },
    }
    return statusMap[status] || { class: "bg-secondary", text: status }
  }

  const getTypeBadge = (type) => {
    const typeMap = {
      vmer: { class: "bg-info", text: "VMER" },
      dc_visit: { class: "bg-success", text: "DC Visit" },
      online: { class: "bg-warning", text: "Online" },
    }
    return typeMap[type] || { class: "bg-secondary", text: "Unknown" }
  }

  // --- Populate Main Details ---
  document.getElementById("case-id").textContent = data.case_id
  document.getElementById("holder-name").textContent = data.holder_name || "N/A"
  document.getElementById("policy-number").textContent = data.policy_number || "N/A"
  document.getElementById("holder-phone").textContent = data.holder_phone || "N/A"
  document.getElementById("created-at").textContent = new Date(data.created_at).toLocaleDateString()

  const statusBadgeInfo = getStatusBadge(data.status)
  const statusEl = document.getElementById("case-status")
  statusEl.className = `badge ${statusBadgeInfo.class}`
  statusEl.textContent = statusBadgeInfo.text

  const typeBadgeInfo = getTypeBadge(data.case_type)
  const typeEl = document.getElementById("case-type")
  typeEl.className = `badge ${typeBadgeInfo.class}`
  typeEl.textContent = typeBadgeInfo.text

  // --- Populate Assignment Details ---
  document.getElementById("assigned-coordinator").textContent = data.assigned_coordinator_id || "Not Assigned"
  document.getElementById("assigned-telecaller").textContent = data.assigned_telecaller_id || "Not Assigned"

  // --- Populate Type-Specific Details ---
  if (data.case_type === "dc_visit") {
    const dcElement = document.getElementById("assigned-dc")
    if (dcElement) dcElement.textContent = data.assigned_dc_id || "Not Assigned"
    // In a real scenario, you'd fetch DC address based on its ID
    const dcAddressEl = document.getElementById("dc-address")
    if (dcAddressEl) dcAddressEl.textContent = data.assigned_dc_id ? "Address for " + data.assigned_dc_id : "N/A"
  } else if (data.case_type === "vmer") {
    // Placeholder for VMER specific data
  }

  // --- Populate Timeline ---
  const timelineList = document.getElementById("timeline-list")
  timelineList.innerHTML = "" // Clear loading state

  // This is a simplified timeline. A real implementation would use a history log.
  const timelineData = [{ title: "Case Created", time: data.created_at, status: "completed" }]

  if (data.assigned_coordinator_id) {
    timelineData.push({
      title: `Assigned to Coordinator: ${data.assigned_coordinator_id}`,
      time: data.updated_at,
      status: "completed",
    })
  } else {
    timelineData.push({ title: "Pending Coordinator Assignment", time: null, status: "pending" })
  }

  if (data.assigned_telecaller_id) {
    timelineData.push({
      title: `Assigned to Tele-caller: ${data.assigned_telecaller_id}`,
      time: data.updated_at,
      status: "completed",
    })
  }

  if (data.status === "scheduled") {
    timelineData.push({ title: "Case Scheduled", time: data.updated_at, status: "completed" })
  }

  if (data.status === "submitted_to_lic" || data.status === "completed") {
    timelineData.push({ title: "Report Submitted", time: data.updated_at, status: "completed" })
  }

  timelineData.forEach((item) => {
    const li = document.createElement("li")
    li.className = `timeline-item ${item.status}`
    li.innerHTML = `
          <div class="timeline-marker"></div>
          <div class="timeline-content">
              <h5 class="timeline-title">${item.title}</h5>
              <p class="text-muted small mb-0">${item.time ? new Date(item.time).toLocaleString() : "Pending"}</p>
          </div>
      `
    timelineList.appendChild(li)
  })
}
