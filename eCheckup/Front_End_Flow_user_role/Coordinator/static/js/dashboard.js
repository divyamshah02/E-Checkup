document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("coordinatorMockData"))
  if (!data) {
    console.error("Coordinator mock data not found in localStorage.")
    return
  }

  const allCases = data.cases
  const rowsPerPage = 10 // Show top 10 for dashboard

  function initializeDashboard() {
    updateStats()
    renderTable()
  }

  function updateStats() {
    // Primary KPI calculations
    const newCases = allCases.filter((c) => c.status === "Tele-caller Assignment Pending")
    const pendingSchedule = allCases.filter((c) => c.status === "Scheduling Pending")
    const reportsUpload = allCases.filter((c) => c.status === "Report Upload Pending")
    const nearingSLA = allCases.filter((c) => c.slaDaysLeft !== null && c.slaDaysLeft <= 2)

    // Update primary stats
    document.getElementById("stat-new-cases").textContent = newCases.length
    document.getElementById("stat-pending-schedule").textContent = pendingSchedule.length
    document.getElementById("stat-reports-upload").textContent = reportsUpload.length
    document.getElementById("stat-nearing-sla").textContent = nearingSLA.length

    // Time-based breakdowns for new cases
    const today = new Date().toDateString()
    const thisWeek = getThisWeekStart()
    const thisMonth = new Date().getMonth()

    document.getElementById("new-cases-today").textContent = newCases.filter(
      (c) => new Date(c.assignedOn).toDateString() === today,
    ).length

    document.getElementById("new-cases-week").textContent = newCases.filter(
      (c) => new Date(c.assignedOn) >= thisWeek,
    ).length

    document.getElementById("new-cases-month").textContent = newCases.filter(
      (c) => new Date(c.assignedOn).getMonth() === thisMonth,
    ).length

    // Priority breakdown for scheduling
    document.getElementById("urgent-schedule").textContent = pendingSchedule.filter(
      (c) => c.priority === "Urgent",
    ).length
    document.getElementById("high-schedule").textContent = pendingSchedule.filter((c) => c.priority === "High").length
    document.getElementById("normal-schedule").textContent = pendingSchedule.filter(
      (c) => c.priority === "Normal",
    ).length

    // Case type breakdown for reports
    document.getElementById("vmer-reports").textContent = reportsUpload.filter((c) => c.caseType === "VMER").length
    document.getElementById("dc-reports").textContent = reportsUpload.filter((c) => c.caseType === "DC Visit").length
    document.getElementById("online-reports").textContent = reportsUpload.filter((c) => c.caseType === "Online").length

    // SLA breakdown
    document.getElementById("sla-1day").textContent = allCases.filter((c) => c.slaDaysLeft === 1).length
    document.getElementById("sla-2days").textContent = allCases.filter((c) => c.slaDaysLeft === 2).length
    document.getElementById("sla-3days").textContent = allCases.filter((c) => c.slaDaysLeft === 3).length

    // Case type totals
    const vmerCases = allCases.filter((c) => c.caseType === "VMER")
    const dcCases = allCases.filter((c) => c.caseType === "DC Visit")
    const onlineCases = allCases.filter((c) => c.caseType === "Online")

    document.getElementById("stat-vmer-cases").textContent = vmerCases.length
    document.getElementById("stat-dc-cases").textContent = dcCases.length
    document.getElementById("stat-online-cases").textContent = onlineCases.length

    // Case type status breakdowns
    updateCaseTypeBreakdown("vmer", vmerCases)
    updateCaseTypeBreakdown("dc", dcCases)
    updateCaseTypeBreakdown("online", onlineCases)
  }

  function updateCaseTypeBreakdown(type, cases) {
    const pending = cases.filter(
      (c) => c.status === "Tele-caller Assignment Pending" || c.status === "Scheduling Pending",
    ).length

    const completed = cases.filter((c) => c.status === "Completed" || c.status === "Sent to LIC").length

    const inProgress = cases.filter((c) => c.status === "Report Upload Pending").length

    document.getElementById(`${type}-pending`).textContent = pending
    document.getElementById(`${type}-completed`).textContent = completed
    document.getElementById(`${type}-progress`).textContent = inProgress
  }

  function getThisWeekStart() {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const numDaysPastSunday = dayOfWeek === 0 ? 0 : dayOfWeek
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - numDaysPastSunday)
    weekStart.setHours(0, 0, 0, 0)
    return weekStart
  }

  function renderTable() {
    const tableBody = document.getElementById("cases-table-body")

    const priorityOrder = { Urgent: 3, High: 2, Normal: 1 }
    const sortedCases = [...allCases].sort((a, b) => {
      const priorityA = priorityOrder[a.priority] || 0
      const priorityB = priorityOrder[b.priority] || 0
      if (priorityB !== priorityA) {
        return priorityB - priorityA
      }
      return new Date(b.assignedOn) - new Date(a.assignedOn)
    })

    const paginatedCases = sortedCases.slice(0, rowsPerPage)

    if (paginatedCases.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-5">No priority cases found.</td></tr>`
    } else {
      tableBody.innerHTML = paginatedCases
        .map((caseItem) => {
          const statusInfo = getStatusInfo(caseItem.status)
          const priorityInfo = getPriorityInfo(caseItem.priority)
          const caseTypeInfo = getCaseTypeInfo(caseItem.caseType)

          let detailPage = "#"
          switch (caseItem.caseType) {
            case "VMER":
              detailPage = "vmer-case-details.html"
              break
            case "DC Visit":
              detailPage = "dc-visit-case-details.html"
              break
            case "Online":
              detailPage = "online-case-details.html"
              break
          }

          return `
            <tr>
                <td><strong>${caseItem.caseId}</strong></td>
                <td>${caseItem.policyHolder}</td>
                <td><span class="badge badge-${caseTypeInfo.color}">${caseItem.caseType}</span></td>
                <td><span class="badge badge-${statusInfo.color}">${caseItem.status}</span></td>
                <td><span class="badge badge-${priorityInfo.color}">${caseItem.priority}</span></td>
                <td>${caseItem.assignedOn}</td>
                <td class="text-end">
                    <a href="${detailPage}?caseId=${caseItem.caseId}" class="btn btn-sm btn-secondary"><i class="fas fa-eye"></i> View</a>
                </td>
            </tr>
        `
        })
        .join("")
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

  initializeDashboard()
})
