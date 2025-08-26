// Scheduling Interface JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Initialize scheduling interface
  initializeScheduling()
  setupEventListeners()
  generateCalendar()
  loadTodaysSchedule()
  updateDoctorAvailability()

  function initializeScheduling() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    const bootstrap = window.bootstrap // Declare bootstrap variable
    tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))

    // Set minimum date for appointment scheduling
    const appointmentDateInput = document.getElementById("appointmentDate")
    if (appointmentDateInput) {
      appointmentDateInput.min = new Date().toISOString().split("T")[0]
    }

    // Initialize search functionality
    setupSearchFunctionality()

    // Start real-time updates
    startRealTimeUpdates()
  }

  function setupEventListeners() {
    // Calendar navigation
    document.getElementById("prevMonth")?.addEventListener("click", () => navigateMonth(-1))
    document.getElementById("nextMonth")?.addEventListener("click", () => navigateMonth(1))
    document.getElementById("todayBtn")?.addEventListener("click", goToToday)

    // Calendar view changes
    document.querySelectorAll('input[name="calendarView"]').forEach((radio) => {
      radio.addEventListener("change", function () {
        if (this.checked) {
          switchCalendarView(this.id)
        }
      })
    })

    // Case search in modal
    document.getElementById("searchCaseBtn")?.addEventListener("click", searchCase)
    document.getElementById("caseId")?.addEventListener("input", handleCaseIdInput)

    // Quick action buttons
    document.getElementById("bulkScheduleBtn")?.addEventListener("click", handleBulkSchedule)
    document.getElementById("viewConflictsBtn")?.addEventListener("click", viewConflicts)
    document.getElementById("sendRemindersBtn")?.addEventListener("click", sendReminders)
    document.getElementById("generateReportBtn")?.addEventListener("click", generateReport)

    // Form submissions
    document.getElementById("newAppointmentForm")?.addEventListener("submit", handleAppointmentSubmit)
    document.getElementById("emergencyScheduleForm")?.addEventListener("submit", handleEmergencySubmit)

    // Appointment type change
    document.getElementById("appointmentType")?.addEventListener("change", handleAppointmentTypeChange)

    // Doctor selection change
    document.getElementById("assignedDoctor")?.addEventListener("change", checkDoctorAvailability)
  }

  function generateCalendar() {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    // Update month/year display
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    document.getElementById("monthYear").textContent = `${monthNames[currentMonth]} ${currentYear}`

    // Generate calendar grid
    const calendarGrid = document.getElementById("calendarGrid")
    calendarGrid.innerHTML = ""

    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayElement = createCalendarDay(daysInPrevMonth - i, true, false)
      calendarGrid.appendChild(dayElement)
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === currentDate.getDate() &&
        currentMonth === currentDate.getMonth() &&
        currentYear === currentDate.getFullYear()
      const dayElement = createCalendarDay(day, false, isToday)
      calendarGrid.appendChild(dayElement)
    }

    // Next month days
    const totalCells = calendarGrid.children.length
    const remainingCells = 42 - totalCells // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
      const dayElement = createCalendarDay(day, true, false)
      calendarGrid.appendChild(dayElement)
    }

    // Add appointment indicators
    addAppointmentIndicators()
  }

  function createCalendarDay(day, isOtherMonth, isToday) {
    const dayElement = document.createElement("div")
    dayElement.className = `calendar-day ${isOtherMonth ? "other-month" : ""} ${isToday ? "today" : ""}`
    dayElement.innerHTML = `
    <div class="day-number">${day}</div>
    <div class="appointment-indicators"></div>
  `

    dayElement.addEventListener("click", () => handleDayClick(day, isOtherMonth))

    return dayElement
  }

  function addAppointmentIndicators() {
    // Sample appointment data
    const appointments = {
      15: [{ type: "vmer" }, { type: "dc-visit" }],
      18: [{ type: "vmer" }],
      20: [{ type: "vmer" }, { type: "vmer" }, { type: "dc-visit" }],
      22: [{ type: "emergency" }],
      25: [{ type: "dc-visit" }],
    }

    Object.keys(appointments).forEach((day) => {
      const dayElement = Array.from(document.querySelectorAll(".calendar-day")).find(
        (el) => el.querySelector(".day-number").textContent === day && !el.classList.contains("other-month"),
      )

      if (dayElement) {
        dayElement.classList.add("has-appointments")
        const indicatorsContainer = dayElement.querySelector(".appointment-indicators")

        appointments[day].forEach((appointment) => {
          const indicator = document.createElement("span")
          indicator.className = `appointment-indicator ${appointment.type}`
          indicatorsContainer.appendChild(indicator)
        })
      }
    })
  }

  function handleDayClick(day, isOtherMonth) {
    if (isOtherMonth) return

    // Set the clicked date in the new appointment modal
    const appointmentDate = document.getElementById("appointmentDate")
    if (appointmentDate) {
      const currentDate = new Date()
      const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      appointmentDate.value = selectedDate.toISOString().split("T")[0]
    }

    // Show new appointment modal
    const modal = new window.bootstrap.Modal(document.getElementById("newAppointmentModal")) // Use window.bootstrap
    modal.show()
  }

  function navigateMonth(direction) {
    // Implementation for month navigation
    console.log(`Navigating month: ${direction}`)
    // This would update the calendar display
  }

  function goToToday() {
    generateCalendar()
    showAlert("Navigated to current month", "info")
  }

  function handleViewChange(event) {
    const view = event.target.id.replace("View", "")
    console.log(`Changing to ${view} view`)
    showAlert(`Switched to ${view} view`, "info")
  }

  function searchCase(caseId) {
    if (!caseId) {
      showAlert("Please enter a case ID", "warning")
      return
    }

    // Simulate case search
    showAlert("Searching for case...", "info")

    setTimeout(() => {
      // Simulate found case
      const sampleCases = {
        "LIC-2024-001": {
          patientName: "Rajesh Kumar",
          patientPhone: "+91 9876543210",
          type: "vmer",
        },
        "LIC-2024-002": {
          patientName: "Priya Patel",
          patientPhone: "+91 9876543211",
          type: "dc-visit",
        },
      }

      const caseData = sampleCases[caseId.toUpperCase()]
      if (caseData) {
        document.getElementById("patientName").value = caseData.patientName
        document.getElementById("patientPhone").value = caseData.patientPhone
        document.getElementById("appointmentType").value = caseData.type
        showAlert("Case found and loaded", "success")
      } else {
        showAlert("Case not found", "error")
      }
    }, 1500)
  }

  function handleCaseIdInput(event) {
    const caseId = event.target.value.trim()
    if (caseId.length >= 3) {
      // Auto-search as user types
      clearTimeout(window.caseSearchTimeout)
      window.caseSearchTimeout = setTimeout(() => {
        searchCase(caseId)
      }, 1000)
    }
  }

  function handleBulkSchedule() {
    showAlert("Bulk scheduling feature coming soon", "info")
  }

  function viewConflicts() {
    const conflictsHtml = `
    <div class="modal fade" id="conflictsModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-exclamation-circle me-2 text-warning"></i>
              Scheduling Conflicts
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-warning">
              <i class="fas fa-info-circle me-2"></i>
              Found 3 scheduling conflicts that need attention.
            </div>
            <div class="conflict-list">
              <div class="conflict-item">
                <div class="conflict-header">
                  <h6>Double Booking - Dr. Sharma</h6>
                  <span class="badge bg-danger">High Priority</span>
                </div>
                <div class="conflict-details">
                  <p><strong>Date:</strong> Jan 22, 2024 at 2:00 PM</p>
                  <p><strong>Conflicting Cases:</strong> #LIC-2024-001 and #LIC-2024-005</p>
                  <div class="conflict-actions">
                    <button class="btn btn-sm btn-primary">Resolve</button>
                    <button class="btn btn-sm btn-outline-secondary">Reschedule</button>
                  </div>
                </div>
              </div>
              <div class="conflict-item">
                <div class="conflict-header">
                  <h6>Doctor Unavailable - Dr. Patel</h6>
                  <span class="badge bg-warning">Medium Priority</span>
                </div>
                <div class="conflict-details">
                  <p><strong>Date:</strong> Jan 23, 2024 at 10:00 AM</p>
                  <p><strong>Issue:</strong> Doctor marked as unavailable</p>
                  <div class="conflict-actions">
                    <button class="btn btn-sm btn-primary">Reassign</button>
                    <button class="btn btn-sm btn-outline-secondary">Contact Doctor</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary">Resolve All</button>
          </div>
        </div>
      </div>
    </div>
  `

    document.body.insertAdjacentHTML("beforeend", conflictsHtml)
    const modal = new window.bootstrap.Modal(document.getElementById("conflictsModal")) // Use window.bootstrap
    modal.show()
  }

  function sendReminders() {
    showAlert("Sending appointment reminders...", "info")

    setTimeout(() => {
      showAlert("Reminders sent successfully to 12 patients", "success")
    }, 2000)
  }

  function generateReport() {
    showAlert("Generating scheduling report...", "info")

    setTimeout(() => {
      showAlert("Report generated successfully. Check your downloads.", "success")
      // Simulate download
      const link = document.createElement("a")
      link.href = "#"
      link.download = "scheduling-report.pdf"
      link.click()
    }, 3000)
  }

  function initializeMobileNavigation() {
    const sidebarToggle = document.getElementById("sidebarToggle")
    const sidebar = document.getElementById("sidebar")
    const overlay = document.createElement("div")
    overlay.className = "sidebar-overlay"
    document.body.appendChild(overlay)

    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("show")
        overlay.classList.toggle("show")
      })
    }

    overlay.addEventListener("click", () => {
      sidebar.classList.remove("show")
      overlay.classList.remove("show")
    })

    // Close sidebar on window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        sidebar.classList.remove("show")
        overlay.classList.remove("show")
      }
    })
  }

  function loadTodaysSchedule() {
    // Implementation for loading today's schedule
    console.log("Loading today's schedule")
  }

  function updateDoctorAvailability() {
    // Implementation for updating doctor availability
    console.log("Updating doctor availability")
  }

  function setupSearchFunctionality() {
    // Implementation for setting up search functionality
    console.log("Setting up search functionality")
  }

  function startRealTimeUpdates() {
    // Implementation for starting real-time updates
    console.log("Starting real-time updates")
  }

  function switchCalendarView(viewId) {
    // Implementation for switching calendar view
    console.log(`Switching to ${viewId} view`)
  }

  function handleAppointmentSubmit(event) {
    event.preventDefault()
    // Implementation for handling appointment submission
    console.log("Handling appointment submission")
  }

  function handleEmergencySubmit(event) {
    event.preventDefault()
    // Implementation for handling emergency submission
    console.log("Handling emergency submission")
  }

  function handleAppointmentTypeChange(event) {
    // Implementation for handling appointment type change
    console.log(`Appointment type changed to ${event.target.value}`)
  }

  function checkDoctorAvailability(event) {
    // Implementation for checking doctor availability
    console.log(`Doctor availability checked for ${event.target.value}`)
  }

  function showAlert(message, type) {
    // Implementation for showing alert
    console.log(`Alert: ${message} (${type})`)
  }

  function showNotification(message, type) {
    // Implementation for showing notification
    console.log(`Notification: ${message} (${type})`)
  }
})

// Form validation
document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll(".needs-validation")
  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }
      form.classList.add("was-validated")
    })
  })
})

// Case ID Search
document.addEventListener("DOMContentLoaded", () => {
  const searchCaseBtn = document.getElementById("searchCaseBtn")
  if (searchCaseBtn) {
    searchCaseBtn.addEventListener("click", () => {
      const caseId = document.getElementById("caseId").value
      if (caseId) {
        searchCase(caseId)
      }
    })
  }
})

// Add CSS for pulse animation
const style = document.createElement("style")
style.textContent = `
  .pulse {
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(var(--info-rgb), 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(var(--info-rgb), 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(var(--info-rgb), 0);
    }
  }
  
  .conflict-item {
    border: 1px solid var(--gray-200);
    border-radius: var(--border-radius-md);
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .conflict-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .conflict-details {
    color: var(--gray-600);
  }
  
  .conflict-actions {
    margin-top: 0.5rem;
  }
`
document.head.appendChild(style)
