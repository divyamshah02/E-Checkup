document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("telecallerMockData"))
  if (!data) {
    console.error("Tele-caller mock data not found.")
    return
  }

  const tableBody = document.getElementById("casesTableBody")

  function renderTable() {
    const cases = data.cases
    if (cases.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-5">No cases assigned to you.</td></tr>`
      return
    }

    tableBody.innerHTML = cases
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
                  <a href="${detailPage}?caseId=${caseItem.caseId}" class="btn btn-sm btn-secondary"><i class="fas fa-eye"></i> View</a>
              </td>
          </tr>
      `
      })
      .join("")
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

  renderTable()
})
