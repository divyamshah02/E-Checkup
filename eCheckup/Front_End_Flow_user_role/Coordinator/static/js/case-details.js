document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search)
  const caseId = urlParams.get("caseId")
  const allData = JSON.parse(localStorage.getItem("coordinatorMockData"))

  if (!caseId || !allData) {
    document.querySelector(".main-content").innerHTML =
      '<div class="alert alert-danger">Case data not found. Please return to the dashboard.</div>'
    return
  }

  const caseData = allData.cases.find((c) => c.caseId === caseId)
  if (!caseData) {
    document.querySelector(".main-content").innerHTML =
      '<div class="alert alert-danger">Could not find details for the specified case.</div>'
    return
  }

  function initializePage() {
    populateHeader()
    populateDetails()
    populateTimeline()
    populateDocuments()
    populateActions()
    addEventListeners()
  }

  function populateHeader() {
    document.getElementById("case-id-header").textContent = `Case Details: ${caseData.caseId}`
    // document.getElementById("breadcrumb-case-id").textContent = caseData.caseId
    document.getElementById("case-id-title").textContent = caseData.caseId
    document.getElementById("policy-holder-name").textContent = caseData.policyHolder

    const badgesContainer = document.getElementById("case-badges")
    const caseTypeInfo = getCaseTypeInfo(caseData.caseType)
    const statusInfo = getStatusInfo(caseData.status)
    const priorityInfo = getPriorityInfo(caseData.priority)

    badgesContainer.innerHTML = `
          <span class="badge bg-${caseTypeInfo.color}-soft text-${caseTypeInfo.color}">${caseData.caseType}</span>
          <span class="badge rounded-pill bg-${statusInfo.color}-soft text-${statusInfo.color}">${caseData.status}</span>
          <span class="badge bg-${priorityInfo.color}-soft text-${priorityInfo.color}">${caseData.priority}</span>
      `
  }

  function populateDetails() {
    // These would be fetched from a more detailed API call in a real app
    const phPhone = document.getElementById("ph-phone")
    if (phPhone) phPhone.textContent = "+91 98765 43210"

    const phEmail = document.getElementById("ph-email")
    if (phEmail) phEmail.textContent = "policy.holder@example.com"

    const phAddress = document.getElementById("ph-address")
    if (phAddress) phAddress.textContent = "123, MG Road, Mumbai, Maharashtra"
  }

  function populateTimeline() {
    const timelineContainer = document.getElementById("case-timeline")
    if (!timelineContainer) return

    // This is a simplified, static timeline. A real app would generate this dynamically based on case history.
    const timelineItems = [
      {
        stage: "Case assigned to you",
        icon: "fa-user-check",
        status: "completed",
        notes: "Assigned on " + caseData.assignedOn,
        user: "System",
      },
      {
        stage: "Tele-caller assignment",
        icon: "fa-headset",
        status: "in-progress",
        notes: "Pending assignment to a tele-caller.",
        user: "Coordinator",
      },
    ]

    if (caseData.caseType === "VMER") {
      timelineItems.push(
        {
          stage: "Schedule VMER call",
          icon: "fa-calendar-alt",
          status: "pending",
          notes: "Awaiting schedule confirmation.",
          user: "Tele-caller",
        },
        {
          stage: "Conduct VMER",
          icon: "fa-video",
          status: "pending",
          notes: "Video call to be conducted.",
          user: "Doctor",
        },
        {
          stage: "Upload Video Recording",
          icon: "fa-file-upload",
          status: "pending",
          notes: "Awaiting video upload.",
          user: "Coordinator",
        },
      )
    } else if (caseData.caseType === "DC Visit") {
      timelineItems.push(
        {
          stage: "Schedule DC Visit",
          icon: "fa-calendar-alt",
          status: "pending",
          notes: "Awaiting schedule confirmation.",
          user: "Tele-caller",
        },
        {
          stage: "Policy Holder visits DC",
          icon: "fa-hospital-user",
          status: "pending",
          notes: "Visit to be completed.",
          user: "Policy Holder",
        },
        {
          stage: "Upload Medical Reports",
          icon: "fa-file-upload",
          status: "pending",
          notes: "Awaiting report upload.",
          user: "Coordinator",
        },
      )
    } else {
      // Online case
      timelineItems.push(
        {
          stage: "Collect Documents",
          icon: "fa-folder-open",
          status: "pending",
          notes: "Awaiting document submission.",
          user: "Tele-caller",
        },
        {
          stage: "Verify Documents",
          icon: "fa-check-double",
          status: "pending",
          notes: "Documents to be verified.",
          user: "Coordinator",
        },
      )
    }

    timelineItems.push({
      stage: "Mark as Sent to LIC",
      icon: "fa-paper-plane",
      status: "pending",
      notes: "Final step to close the case.",
      user: "Coordinator",
    })

    timelineContainer.innerHTML = timelineItems
      .map((item) => {
        let itemClass = "pending"
        if (item.status === "completed") itemClass = "completed"
        if (item.status === "in-progress") itemClass = "in-progress"

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

  function populateDocuments() {
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

  function populateActions() {
    const telecallerSelect = document.getElementById("telecaller-select")
    allData.telecallers.forEach((tc) => {
      const option = document.createElement("option")
      option.value = tc.id
      option.textContent = tc.name
      telecallerSelect.appendChild(option)
    })
  }

  function addEventListeners() {
    const assignBtn = document.getElementById("assign-telecaller-btn")
    if (assignBtn) {
      assignBtn.addEventListener("click", () => {
        const selected = document.getElementById("telecaller-select").value
        if (selected !== "Choose...") {
          alert("Tele-caller assigned successfully!")
        } else {
          alert("Please select a tele-caller.")
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

  // Helper functions for styling
  function getStatusInfo(status) {
    switch (status) {
      case "Tele-caller Assignment Pending":
        return { color: "primary" }
      case "Scheduling Pending":
        return { color: "warning" }
      case "Report Upload Pending":
        return { color: "info" }
      case "Sent to LIC":
        return { color: "secondary" }
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
