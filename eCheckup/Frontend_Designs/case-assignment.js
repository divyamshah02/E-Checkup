// Case Assignment Functionality
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners()
  loadUnassignedCases()

  function setupEventListeners() {
    // Select all functionality
    const selectAllCheckbox = document.getElementById("selectAllCheckbox")
    const selectAllBtn = document.getElementById("selectAllBtn")
    const caseCheckboxes = document.querySelectorAll(".case-checkbox")

    selectAllCheckbox.addEventListener("change", function () {
      caseCheckboxes.forEach((checkbox) => {
        checkbox.checked = this.checked
      })
      updateBulkAssignButton()
    })

    selectAllBtn.addEventListener("click", () => {
      const allChecked = Array.from(caseCheckboxes).every((cb) => cb.checked)
      caseCheckboxes.forEach((checkbox) => {
        checkbox.checked = !allChecked
      })
      selectAllCheckbox.checked = !allChecked
      updateBulkAssignButton()
    })

    // Individual checkbox changes
    caseCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const allChecked = Array.from(caseCheckboxes).every((cb) => cb.checked)
        const someChecked = Array.from(caseCheckboxes).some((cb) => cb.checked)

        selectAllCheckbox.checked = allChecked
        selectAllCheckbox.indeterminate = someChecked && !allChecked
        updateBulkAssignButton()
      })
    })

    // Bulk assignment
    document.getElementById("bulkAssignBtn").addEventListener("click", handleBulkAssignment)

    // Individual assignment dropdowns
    document.querySelectorAll(".dropdown-item").forEach((item) => {
      item.addEventListener("click", function (e) {
        e.preventDefault()
        const coordinator = this.getAttribute("data-coordinator")
        const coordinatorName = this.textContent
        const row = this.closest("tr")
        const caseId = row.querySelector(".case-checkbox").value

        assignCase(caseId, coordinator, coordinatorName, row)
      })
    })

    // Refresh button
    document.getElementById("refreshBtn").addEventListener("click", function () {
      this.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Refreshing...'
      setTimeout(() => {
        this.innerHTML = '<i class="fas fa-sync-alt me-1"></i>Refresh'
        loadUnassignedCases()
      }, 1500)
    })
  }

  function updateBulkAssignButton() {
    const selectedCases = document.querySelectorAll(".case-checkbox:checked")
    const bulkAssignBtn = document.getElementById("bulkAssignBtn")

    if (selectedCases.length > 0) {
      bulkAssignBtn.innerHTML = `<i class="fas fa-check-double me-2"></i>Assign ${selectedCases.length} Cases`
      bulkAssignBtn.disabled = false
    } else {
      bulkAssignBtn.innerHTML = '<i class="fas fa-check-double me-2"></i>Assign Selected'
      bulkAssignBtn.disabled = true
    }
  }

  function handleBulkAssignment() {
    const selectedCases = document.querySelectorAll(".case-checkbox:checked")
    const coordinator = document.getElementById("bulkCoordinator").value
    const coordinatorName =
      document.getElementById("bulkCoordinator").options[document.getElementById("bulkCoordinator").selectedIndex].text

    if (!coordinator) {
      showAlert("Please select a coordinator for bulk assignment", "warning")
      return
    }

    if (selectedCases.length === 0) {
      showAlert("Please select at least one case to assign", "warning")
      return
    }

    // Show confirmation modal
    const confirmationHtml = `
            <div class="modal fade" id="bulkConfirmModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Confirm Bulk Assignment</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>Are you sure you want to assign <strong>${selectedCases.length} cases</strong> to <strong>${coordinatorName}</strong>?</p>
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                This action will send notifications to the coordinator and policy holders.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="confirmBulkAssignment('${coordinator}', '${coordinatorName}')">
                                Confirm Assignment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `

    document.body.insertAdjacentHTML("beforeend", confirmationHtml)
    const modal = window.bootstrap.Modal.getInstance(document.getElementById("bulkConfirmModal"))
    modal.show()
  }

  function assignCase(caseId, coordinator, coordinatorName, row) {
    // Show loading state
    const assignBtn = row.querySelector(".dropdown-toggle")
    assignBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
    assignBtn.disabled = true

    // Simulate API call
    setTimeout(() => {
      // Remove row from unassigned table
      row.remove()

      // Update statistics
      updateStatistics(-1, 1)

      showAlert(`Case ${caseId} assigned to ${coordinatorName}`, "success")
    }, 1500)
  }

  function loadUnassignedCases() {
    // Simulate loading cases from API
    console.log("Loading unassigned cases...")

    // In a real application, this would fetch data from the server
    // and populate the table dynamically
  }

  function updateStatistics(unassignedChange, activeChange) {
    const unassignedElement = document.querySelector(".text-primary")
    const activeElement = document.querySelector(".text-success")

    const currentUnassigned = Number.parseInt(unassignedElement.textContent)
    const currentActive = Number.parseInt(activeElement.textContent)

    unassignedElement.textContent = currentUnassigned + unassignedChange
    activeElement.textContent = currentActive + activeChange
  }

  function showAlert(message, type) {
    const alertDiv = document.createElement("div")
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`
    alertDiv.style.cssText = "top: 20px; right: 20px; z-index: 1050; min-width: 300px;"
    alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `

    document.body.appendChild(alertDiv)

    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove()
      }
    }, 5000)
  }

  // Global function for bulk assignment confirmation
  window.confirmBulkAssignment = (coordinator, coordinatorName) => {
    const selectedCases = document.querySelectorAll(".case-checkbox:checked")
    const modal = window.bootstrap.Modal.getInstance(document.getElementById("bulkConfirmModal"))

    // Show processing state
    const confirmBtn = document.querySelector("#bulkConfirmModal .btn-primary")
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Assigning...'
    confirmBtn.disabled = true

    // Simulate bulk assignment
    setTimeout(() => {
      // Remove assigned rows
      selectedCases.forEach((checkbox) => {
        const row = checkbox.closest("tr")
        row.remove()
      })

      // Update statistics
      updateStatistics(-selectedCases.length, selectedCases.length)

      // Reset form
      document.getElementById("bulkCoordinator").value = ""
      document.getElementById("selectAllCheckbox").checked = false
      updateBulkAssignButton()

      modal.hide()
      showAlert(`${selectedCases.length} cases assigned to ${coordinatorName} successfully`, "success")
    }, 2000)
  }
})
