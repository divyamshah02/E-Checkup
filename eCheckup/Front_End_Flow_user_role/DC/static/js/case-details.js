document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search)
  const caseId = urlParams.get("id")

  const cases = JSON.parse(localStorage.getItem("dcCases")) || []
  const caseData = cases.find((c) => c.id === caseId)

  if (!caseData) {
    document.querySelector(".main-content").innerHTML = "<h1>Case not found</h1>"
    return
  }

  // Populate case details
  document.getElementById("proposer-name-header").textContent = caseData.proposerName
  const statusBadge = document.getElementById("case-status-badge")
  statusBadge.textContent = caseData.status
  statusBadge.className = `status-badge status-${caseData.status.toLowerCase().replace(/\s+/g, "-")}`

  document.getElementById("policy-no").textContent = caseData.policyNo
  document.getElementById("applicant-name").textContent = caseData.applicantName
  document.getElementById("applicant-contact").textContent = caseData.applicantContact
  document.getElementById("sum-assured").textContent = `₹ ${caseData.sumAssured}`
  document.getElementById("applicant-address").textContent = caseData.applicantAddress

  // Populate appointment details
  document.getElementById("visit-datetime").textContent = caseData.visitDateTime
  document.getElementById("telecaller-contact").textContent = caseData.telecallerContact

  // Populate LIC hierarchy
  document.getElementById("lic-branch").textContent = caseData.licHierarchy.branch
  document.getElementById("lic-division").textContent = caseData.licHierarchy.division
  document.getElementById("lic-zone").textContent = caseData.licHierarchy.zone

  // Populate case journey
  const timeline = document.getElementById("case-journey-timeline")
  if (timeline && caseData.caseJourney) {
    timeline.innerHTML = ""
    caseData.caseJourney.forEach((step) => {
      const li = document.createElement("li")
      li.className = `timeline-item status-${step.status.toLowerCase()}`
      li.innerHTML = `
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <p class="timeline-title">${step.stage}</p>
                    <p class="timeline-date">${step.date}</p>
                </div>
            `
      timeline.appendChild(li)
    })
  }

  // Handle report upload
  const uploadBtn = document.getElementById("upload-report-btn")
  const fileInput = document.getElementById("report-file-input")
  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener("click", () => {
      fileInput.click()
    })

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0]
      if (file) {
        console.log("File selected:", file.name)
        alert(`File "${file.name}" selected for upload.`)
        // Here you would typically handle the file upload process
      }
    })
  }
})
