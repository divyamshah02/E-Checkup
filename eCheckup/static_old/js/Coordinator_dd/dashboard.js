let allCases = []
let csrfToken = ""
let caseApiUrl = ""

async function InitializeDashboard(token, apiUrl, apiFunction) {
  csrfToken = token
  caseApiUrl = apiUrl

  await loadData()
  addEventListeners()
  setInterval(loadData, 60000) // Refresh every minute
}

async function loadData() {
  console.log("Fetching coordinator data...")
  const [success, result] = await callApi("GET", caseApiUrl, null, csrfToken)

  if (success && result.success) {
    allCases = result.data.all_cases || []
    console.log(`Found ${allCases.length} cases for this coordinator.`)
    updateAllStats()
    renderTable()
    document.getElementById("last-updated").textContent = new Date().toLocaleTimeString()
  } else {
    console.error("Failed to load case data:", result.error)
    const tableBody = document.getElementById("cases-table-body")
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-5 text-danger">Error loading data. Please refresh.</td></tr>`
  }
}

function updateAllStats() {
  // Status definitions
  const isNew = (c) => c.status === "assigned_to_coordinator"
  const isSchedulingPending = (c) => c.status === "telecaller_assigned"
  const isReportPending = (c) => c.status === "report_uploaded_by_dc" || c.status === "report_uploaded_by_medco"
  const isCompleted = (c) => c.status === "completed" || c.status === "submitted_to_lic"
  const isInProgress = (c) => !isNew(c) && !isSchedulingPending(c) && !isReportPending(c) && !isCompleted(c)

  // 1. New Cases Assigned
  const newCases = allCases.filter(isNew)
  document.getElementById("stat-new-cases").textContent = newCases.length
  const today = new Date()
  const startOfWeek = new Date()
  startOfWeek.setDate(today.getDate() - today.getDay())
  document.getElementById("new-cases-today").textContent = newCases.filter(
    (c) => new Date(c.created_at).toDateString() === today.toDateString(),
  ).length
  document.getElementById("new-cases-week").textContent = newCases.filter(
    (c) => new Date(c.created_at) >= startOfWeek,
  ).length
  document.getElementById("new-cases-month").textContent = newCases.filter(
    (c) => new Date(c.created_at).getMonth() === today.getMonth(),
  ).length

  // 2. Scheduling Pending
  const pendingSchedule = allCases.filter(isSchedulingPending)
  document.getElementById("stat-pending-schedule").textContent = pendingSchedule.length
  document.getElementById("urgent-schedule").textContent = pendingSchedule.filter((c) => c.priority === "urgent").length
  document.getElementById("high-schedule").textContent = pendingSchedule.filter((c) => c.priority === "high").length
  document.getElementById("normal-schedule").textContent = pendingSchedule.filter((c) => c.priority === "normal").length

  // 3. Reports to Verify
  const reportsToVerify = allCases.filter(isReportPending)
  document.getElementById("stat-reports-upload").textContent = reportsToVerify.length
  document.getElementById("vmer-reports").textContent = reportsToVerify.filter((c) => c.case_type === "vmer").length
  document.getElementById("dc-reports").textContent = reportsToVerify.filter((c) => c.case_type === "dc_visit").length
  document.getElementById("online-reports").textContent = reportsToVerify.filter((c) => c.case_type === "online").length

  // 4. Cases Nearing SLA
  const nearingSLA = allCases.filter((c) => c.sla_days_left !== null && c.sla_days_left <= 3 && !isCompleted(c))
  document.getElementById("stat-nearing-sla").textContent = nearingSLA.length
  document.getElementById("sla-1day").textContent = nearingSLA.filter((c) => c.sla_days_left <= 1).length
  document.getElementById("sla-2days").textContent = nearingSLA.filter(
    (c) => c.sla_days_left > 1 && c.sla_days_left <= 2,
  ).length
  document.getElementById("sla-3days").textContent = nearingSLA.filter(
    (c) => c.sla_days_left > 2 && c.sla_days_left <= 3,
  ).length

  // Case Type Breakdowns
  const caseTypes = ["vmer", "dc_visit", "online"]
  caseTypes.forEach((type) => {
    const casesOfType = allCases.filter((c) => c.case_type === type)
    const typePrefix = type.split("_")[0] // vmer, dc, online

    document.getElementById(`stat-${typePrefix}-cases`).textContent = casesOfType.length
    document.getElementById(`${typePrefix}-pending`).textContent = casesOfType.filter(
      (c) => isNew(c) || isSchedulingPending(c),
    ).length
    document.getElementById(`${typePrefix}-progress`).textContent = casesOfType.filter(isInProgress).length
    document.getElementById(`${typePrefix}-completed`).textContent = casesOfType.filter(isCompleted).length
  })
}

function renderTable() {
  const tableBody = document.getElementById("cases-table-body")
  const priorityOrder = { urgent: 3, high: 2, normal: 1 }

  const sortedCases = [...allCases]
    .filter((c) => c.status !== "completed" && c.status !== "submitted_to_lic")
    .sort((a, b) => {
      const priorityA = priorityOrder[a.priority] || 0
      const priorityB = priorityOrder[b.priority] || 0
      if (priorityB !== priorityA) return priorityB - priorityA
      return new Date(a.created_at) - new Date(b.created_at)
    })

  const paginatedCases = sortedCases.slice(0, 10) // Top 10 for dashboard

  if (paginatedCases.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-5">No active priority cases found.</td></tr>`
    return
  }

  tableBody.innerHTML = paginatedCases
    .map((caseItem) => {
      const statusInfo = getStatusInfo(caseItem.status)
      const priorityInfo = getPriorityInfo(caseItem.priority)
      const caseTypeInfo = getCaseTypeInfo(caseItem.case_type)
      const detailPageUrl = `/case-detail/${caseItem.case_id}/`

      return `
            <tr>
                <td><strong>${caseItem.case_id}</strong></td>
                <td>${caseItem.holder_name}</td>
                <td><span class="badge badge-${caseTypeInfo.color}">${caseTypeInfo.label}</span></td>
                <td><span class="badge badge-${statusInfo.color}">${statusInfo.label}</span></td>
                <td><span class="badge badge-${priorityInfo.color}">${priorityInfo.label}</span></td>
                <td>${new Date(caseItem.created_at).toLocaleDateString("en-GB")}</td>
                <td class="text-end">
                    <a href="${detailPageUrl}" class="btn btn-sm btn-outline-primary"><i class="fas fa-eye"></i> View</a>
                </td>
            </tr>
        `
    })
    .join("")
}

function addEventListeners() {
  const sidebarToggle = document.getElementById("sidebarToggle")
  const sidebar = document.getElementById("sidebar")
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => sidebar.classList.toggle("show"))
  }

  const refreshBtn = document.getElementById("refreshBtn")
  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadData)
  }
}

// Helper functions for styling
function getStatusInfo(status) {
  const map = {
    assigned_to_coordinator: { color: "primary", label: "New" },
    telecaller_assigned: { color: "warning", label: "Scheduling" },
    appointment_scheduled: { color: "info", label: "Scheduled" },
    report_uploaded_by_dc: { color: "info", label: "Report Pending" },
    report_uploaded_by_medco: { color: "info", label: "Report Pending" },
    completed: { color: "success", label: "Completed" },
    submitted_to_lic: { color: "success", label: "Submitted" },
  }
  return map[status] || { color: "secondary", label: status.replace(/_/g, " ") }
}

function getPriorityInfo(priority) {
  const map = {
    urgent: { color: "danger", label: "Urgent" },
    high: { color: "warning", label: "High" },
    normal: { color: "primary", label: "Normal" },
  }
  return map[priority] || { color: "secondary", label: "N/A" }
}

function getCaseTypeInfo(caseType) {
  const map = {
    vmer: { color: "info", label: "VMER" },
    dc_visit: { color: "success", label: "DC Visit" },
    online: { color: "primary", label: "Online" },
  }
  return map[caseType] || { color: "secondary", label: "Unknown" }
}
