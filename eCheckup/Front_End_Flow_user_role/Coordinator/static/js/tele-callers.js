document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("coordinatorMockData"))
  if (!data || !data.telecallers) {
    console.error("Tele-caller data not found in localStorage.")
    return
  }

  const tableBody = document.getElementById("telecallers-table-body")

  function renderTable() {
    if (data.telecallers.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-5">No tele-callers found.</td></tr>`
      return
    }

    tableBody.innerHTML = data.telecallers
      .map((tc) => {
        // In a real app, these stats would be calculated from case data
        const activeCases = Math.floor(Math.random() * 10) + 1
        const completedMonth = Math.floor(Math.random() * 20) + 5
        const avgResolution = `${(Math.random() * 2 + 1).toFixed(1)} days`
        const status = Math.random() > 0.2 ? "Online" : "Offline"
        const statusColor = status === "Online" ? "success" : "secondary"

        return `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="/placeholder.svg?height=40&width=40" alt="${tc.name}" class="rounded-circle me-3">
                            <div>
                                <div class="fw-semibold">${tc.name}</div>
                                <div class="text-muted small">${tc.id}@echeckup.com</div>
                            </div>
                        </div>
                    </td>
                    <td>${activeCases}</td>
                    <td>${completedMonth}</td>
                    <td>${avgResolution}</td>
                    <td><span class="badge badge-${statusColor}">${status}</span></td>
                </tr>
            `
      })
      .join("")
  }

  renderTable()
})
