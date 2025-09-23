document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search)
  const caseId = urlParams.get("caseId")
  const allData = JSON.parse(localStorage.getItem("telecallerMockData"))

  if (!caseId || !allData) {
    document.querySelector(".main-content").innerHTML = '<div class="alert alert-danger">Case data not found.</div>'
    return
  }

  const caseData = allData.cases.find((c) => c.caseId === caseId)
  if (!caseData) {
    document.querySelector(".main-content").innerHTML =
      '<div class="alert alert-danger">Could not find details for this case.</div>'
    return
  }

  function initializePage() {
    populateHeader()
    populateTimeline()
    populatePastSchedules()
    addEventListeners()
  }

  function populateHeader() {
    document.getElementById("case-id-header").textContent = caseData.caseId
    document.getElementById("case-id-title").textContent = caseData.caseId
    document.getElementById("policy-holder-name").textContent = caseData.policyHolder

    const badgesContainer = document.getElementById("case-badges")
    const caseTypeInfo = getCaseTypeInfo(caseData.caseType)
    const statusInfo = getStatusInfo(caseData.status)
    const priorityInfo = getPriorityInfo(caseData.priority)

    badgesContainer.innerHTML = `
            <span class="badge badge-${caseTypeInfo.color}">${caseData.caseType}</span>
            <span class="badge badge-${statusInfo.color}">${caseData.status}</span>
            <span class="badge badge-${priorityInfo.color}">${caseData.priority}</span>
        `
  }

  function populateTimeline() {
    const timelineContainer = document.getElementById("case-timeline")
    if (!timelineContainer) return
    timelineContainer.innerHTML = `
        <div class="timeline-item completed"><div class="timeline-icon"><i class="fas fa-user-check"></i></div><div class="timeline-content"><h6>Case assigned to you</h6></div></div>
        <div class="timeline-item in-progress"><div class="timeline-icon"><i class="fas fa-headset"></i></div><div class="timeline-content"><h6>Your action required</h6><p>Schedule appointment and upload documents.</p></div></div>
        <div class="timeline-item"><div class="timeline-icon"><i class="fas fa-user-cog"></i></div><div class="timeline-content"><h6>Coordinator Review</h6></div></div>
    `
  }

  function populatePastSchedules() {
    const container = document.getElementById("past-schedules")
    if (!container) return

    if (!caseData.schedules || caseData.schedules.length === 0) {
      container.innerHTML = '<p class="text-muted">No appointments have been scheduled for this case yet.</p>'
      return
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    ${caseData.schedules
                      .map(
                        (s) => `
                        <tr>
                            <td>${s.type} ${s.dc ? `(${s.dc})` : ""}</td>
                            <td>${new Date(s.dateTime).toLocaleString()}</td>
                            <td><span class="badge bg-info-soft text-info">${s.status}</span></td>
                            <td class="text-end">
                                <button class="btn btn-sm btn-outline-secondary" onclick="alert('Rescheduling schedule ID ${s.id}')">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                            </td>
                        </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>
        </div>
    `
  }

  function addEventListeners() {
    const scheduleBtn = document.getElementById("schedule-btn")
    if (scheduleBtn) {
      scheduleBtn.addEventListener("click", () => {
        const datetime = document.getElementById("appointment-datetime").value
        if (datetime) {
          alert(`Appointment scheduled for: ${new Date(datetime).toLocaleString()}. (This is a simulation)`)
        } else {
          alert("Please select a date and time.")
        }
      })
    }

    const uploadBtn = document.getElementById("upload-report-btn")
    if (uploadBtn) {
      uploadBtn.addEventListener("click", () => {
        const fileInput = document.getElementById("report-file-input")
        if (fileInput.files.length > 0) {
          alert(`Uploading ${fileInput.files[0].name}... (This is a simulation)`)
        } else {
          alert("Please select a file to upload.")
        }
      })
    }
  }

  // Helper functions for styling
  function getStatusInfo(status) {
    switch (status) {
      case "Scheduling Pending":
        return { color: "primary" }
      case "Report Upload Pending":
        return { color: "warning" }
      case "Completed":
        return { color: "success" }
      default:
        return { color: "secondary" }
    }
  }

  function getPriorityInfo(priority) {
    switch (priority) {
      case "Urgent":
        return { color: "danger" }
      case "High":
        return { color: "warning" }
      case "Normal":
        return { color: "primary" }
      default:
        return { color: "secondary" }
    }
  }

  function getCaseTypeInfo(caseType) {
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

  initializePage()
})
