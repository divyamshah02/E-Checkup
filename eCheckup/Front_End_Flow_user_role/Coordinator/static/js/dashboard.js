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
    document.getElementById("stat-new-cases").textContent = allCases.filter(
      (c) => c.status === "Tele-caller Assignment Pending",
    ).length
    document.getElementById("stat-pending-schedule").textContent = allCases.filter(
      (c) => c.status === "Scheduling Pending",
    ).length
    document.getElementById("stat-reports-upload").textContent = allCases.filter(
      (c) => c.status === "Report Upload Pending",
    ).length
    document.getElementById("stat-nearing-sla").textContent = allCases.filter(
      (c) => c.slaDaysLeft !== null && c.slaDaysLeft <= 2,
    ).length
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
