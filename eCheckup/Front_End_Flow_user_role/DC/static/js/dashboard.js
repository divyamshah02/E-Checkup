document.addEventListener("DOMContentLoaded", () => {
  const cases = JSON.parse(localStorage.getItem("dcCases")) || []

  const renderCases = (caseList) => {
    const tbody = document.getElementById("dc-cases-tbody")
    if (!tbody) return

    tbody.innerHTML = "" // Clear existing rows

    if (caseList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">No cases found.</td></tr>'
      return
    }

    caseList.forEach((caseItem) => {
      const row = document.createElement("tr")

      row.innerHTML = `
                <td>${caseItem.proposerName}</td>
                <td>${caseItem.policyNo}</td>
                <td><span class="status-badge status-${caseItem.status.toLowerCase().replace(/\s+/g, "-")}">${caseItem.status}</span></td>
                <td>${caseItem.assignedOn}</td>
                <td><a href="./case-details.html?id=${caseItem.id}" class="btn btn-primary btn-sm">View Details</a></td>
            `

      tbody.appendChild(row)
    })
  }

  renderCases(cases)

  const searchBar = document.querySelector(".search-bar")
  if (searchBar) {
    searchBar.addEventListener("keyup", (e) => {
      const searchTerm = e.target.value.toLowerCase()
      const filteredCases = cases.filter(
        (c) => c.proposerName.toLowerCase().includes(searchTerm) || c.policyNo.toLowerCase().includes(searchTerm),
      )
      renderCases(filteredCases)
    })
  }
})
