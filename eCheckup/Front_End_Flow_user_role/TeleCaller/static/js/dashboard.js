document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("telecallerMockData"))
  if (!data) {
    console.error("Tele-caller mock data not found in localStorage.")
    return
  }

  const allCases = data.cases
  let filteredCases = [...allCases]

  function initializeDashboard() {
    document.getElementById("user-name").textContent = data.user.name
    updateStats()
    renderTable()
    setupFilters()
  }

  function updateStats() {
    // Primary KPI calculations
    const totalCases = allCases.length
    const schedulingPending = allCases.filter((c) => c.status === "Scheduling Pending")
    const uploadPending = allCases.filter((c) => c.status === "Report Upload Pending")
    const completed = allCases.filter((c) => c.status === "Completed")

    // Update primary stats
    document.getElementById("stat-total-cases").textContent = totalCases
    document.getElementById("stat-scheduling-pending").textContent = schedulingPending.length
    document.getElementById("stat-upload-pending").textContent = uploadPending.length
    document.getElementById("stat-completed").textContent = completed.length

    // Time-based breakdowns
    const today = new Date().toDateString()
    const thisWeek = getThisWeekStart()
    const thisMonth = new Date().getMonth()

    // Cases assigned today/week/month
    document.getElementById("cases-today").textContent = allCases.filter(
      (c) => new Date(c.assignedOn).toDateString() === today,
    ).length

    document.getElementById("cases-week").textContent = allCases.filter(
      (c) => new Date(c.assignedOn) >= thisWeek,
    ).length

    document.getElementById("cases-month").textContent = allCases.filter(
      (c) => new Date(c.assignedOn).getMonth() === thisMonth,
    ).length

    // Priority breakdown for scheduling
    document.getElementById("urgent-scheduling").textContent = schedulingPending.filter(
      (c) => c.priority === "Urgent",
    ).length
    document.getElementById("high-scheduling").textContent = schedulingPending.filter(
      (c) => c.priority === "High",
    ).length
    document.getElementById("normal-scheduling").textContent = schedulingPending.filter(
      (c) => c.priority === "Normal",
    ).length

    // Upload type breakdown
    document.getElementById("video-uploads").textContent = uploadPending.filter((c) => c.caseType === "VMER").length
    document.getElementById("report-uploads").textContent = uploadPending.filter(
      (c) => c.caseType === "DC Visit",
    ).length
    document.getElementById("doc-uploads").textContent = uploadPending.filter((c) => c.caseType === "Online").length

    // Completed cases time breakdown
    document.getElementById("completed-today").textContent = completed.filter(
      (c) => new Date(c.completedOn || c.assignedOn).toDateString() === today,
    ).length

    document.getElementById("completed-week").textContent = completed.filter(
      (c) => new Date(c.completedOn || c.assignedOn) >= thisWeek,
    ).length

    document.getElementById("completed-month").textContent = completed.filter(
      (c) => new Date(c.completedOn || c.assignedOn).getMonth() === thisMonth,
    ).length

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
    const pending = cases.filter((c) => c.status === "Scheduling Pending").length
    const scheduled = cases.filter((c) => c.status === "Report Upload Pending").length
    const completed = cases.filter((c) => c.status === "Completed").length

    document.getElementById(`${type}-pending`).textContent = pending
    document.getElementById(`${type}-scheduled`).textContent = scheduled
    document.getElementById(`${type}-completed`).textContent = completed
  }

  function renderTable() {
    const tableBody = document.getElementById("cases-table-body")

    if (filteredCases.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-5">No cases found.</td></tr>`
      return
    }

    tableBody.innerHTML = filteredCases
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
                <td class="text-end">
                    <a href="${detailPage}?caseId=${caseItem.caseId}" class="btn btn-sm btn-primary"><i class="fas fa-eye"></i> View Details</a>
                </td>
            </tr>
        `
      })
      .join("")
  }

  function setupFilters() {
    const statusFilter = document.getElementById("filter-status")
    const typeFilter = document.getElementById("filter-type")

    statusFilter.addEventListener("change", applyFilters)
    typeFilter.addEventListener("change", applyFilters)
  }

  function applyFilters() {
    const statusFilter = document.getElementById("filter-status").value
    const typeFilter = document.getElementById("filter-type").value

    filteredCases = allCases.filter((caseItem) => {
      const statusMatch = !statusFilter || caseItem.status === statusFilter
      const typeMatch = !typeFilter || caseItem.caseType === typeFilter
      return statusMatch && typeMatch
    })

    renderTable()
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

  // Helper functions for styling
  function getStatusInfo(status) {
    switch (status) {
      case "Scheduling Pending":
        return { color: "warning" }
      case "Report Upload Pending":
        return { color: "info" }
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
