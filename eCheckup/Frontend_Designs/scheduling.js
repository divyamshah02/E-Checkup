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

  function searchCase() {
    const caseId = document.getElementById("caseId").value.trim()
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
          priority: "high",
        },
        "LIC-2024-002": {
          patientName: "Priya Patel",
          patientPhone: "+91 9876543211",
          type: "dc-visit",
          priority: "medium",
        },
        "LIC-2024-003": {
          patientName: "Amit Singh",
          patientPhone: "+91 9876543212",
          type: "follow-up",
          priority: "normal",
        },
      }

      const caseData = sampleCases[caseId.toUpperCase()]
      if (caseData) {
        document.getElementById("patientName").value = caseData.patientName
        document.getElementById("patientPhone").value = caseData.patientPhone
        document.getElementById("appointmentType").value = caseData.type
        document.getElementById("priority").value = caseData.priority
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
        searchCase()
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
    showNotification("Sending appointment reminders...", "info")

    setTimeout(() => {
      showNotification("Reminders sent successfully to 12 patients", "success")
    }, 2000)
  }

  function generateReport() {
    showNotification("Generating scheduling report...", "info")

    setTimeout(() => {
      showNotification("Report generated successfully. Check your downloads.", "success")
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

  function setupSearchFunctionality() {
    const searchInput = document.getElementById("searchAppointments")
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        filterAppointments(this.value)
      })
    }
  }

  function startRealTimeUpdates() {
    // Update stats every 30 seconds
    setInterval(updateStats, 30000)

    // Update doctor availability every 60 seconds
    setInterval(updateDoctorAvailability, 60000)

    // Update schedule every 2 minutes
    setInterval(updateSchedule, 120000)
  }

  function updateStats() {
    const statNumbers = document.querySelectorAll(".stat-number")
    statNumbers.forEach((stat) => {
      const currentValue = Number.parseInt(stat.textContent)
      const change = Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
      const newValue = Math.max(0, currentValue + change)

      if (newValue !== currentValue) {
        animateNumber(stat, currentValue, newValue)
      }
    })
  }

  function animateNumber(element, from, to) {
    const duration = 1000
    const steps = 20
    const stepValue = (to - from) / steps
    let current = from
    let step = 0

    const timer = setInterval(() => {
      step++
      current += stepValue
      element.textContent = Math.round(current)

      if (step >= steps) {
        clearInterval(timer)
        element.textContent = to
      }
    }, duration / steps)
  }

  function updateDoctorAvailability() {
    const statusIndicators = document.querySelectorAll(".status-indicator")
    statusIndicators.forEach((indicator) => {
      // Randomly change status (simulate real-time updates)
      if (Math.random() > 0.8) {
        // 20% chance of status change
        const statuses = ["online", "busy", "offline"]
        const currentStatus = indicator.className.split(" ").find((cls) => statuses.includes(cls))
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)]

        if (currentStatus !== newStatus) {
          indicator.classList.remove(currentStatus)
          indicator.classList.add(newStatus)

          // Update corresponding badge
          const doctorItem = indicator.closest(".doctor-item")
          const badge = doctorItem.querySelector(".badge")
          if (badge) {
            badge.className = `badge bg-${getStatusColor(newStatus)}`
            badge.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
          }
        }
      }
    })
  }

  function getStatusColor(status) {
    switch (status) {
      case "online":
        return "success"
      case "busy":
        return "warning"
      case "offline":
        return "secondary"
      default:
        return "secondary"
    }
  }

  function handleAppointmentSubmit(event) {
    event.preventDefault()
    scheduleAppointment()
  }

  function handleEmergencySubmit(event) {
    event.preventDefault()
    scheduleEmergencyAppointment()
  }

  function handleAppointmentTypeChange(event) {
    const selectedType = event.target.value
    console.log(`Appointment type changed to: ${selectedType}`)
    // Additional logic based on appointment type change
  }

  function checkDoctorAvailability(event) {
    const selectedDoctor = event.target.value
    console.log(`Doctor selected: ${selectedDoctor}`)
    // Additional logic to check doctor availability
  }

  function filterAppointments(searchTerm) {
    const rows = document.querySelectorAll("tbody tr")
    rows.forEach((row) => {
      const text = row.textContent.toLowerCase()
      const matches = text.includes(searchTerm.toLowerCase())
      row.style.display = matches ? "" : "none"
    })
  }

  function updateSchedule() {
    // Simulate schedule updates
    console.log("Updating schedule...")

    // Add loading animation to schedule items
    const scheduleItems = document.querySelectorAll(".schedule-item")
    scheduleItems.forEach((item) => {
      item.classList.add("loading")
      setTimeout(() => {
        item.classList.remove("loading")
      }, 1000)
    })
  }

  function switchCalendarView(viewType) {
    console.log("Switching to view:", viewType)
    // Implementation for different calendar views
    // This would typically involve different rendering logic
  }

  function showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div")
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`
    notification.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 300px;"
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `

    document.body.appendChild(notification)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove()
      }
    }, 5000)
  }

  function showAlert(message, type = "info") {
    showNotification(message, type)
  }

  function loadTodaysSchedule() {
    console.log("Loading today's schedule...")
    // Implementation to load today's schedule
  }

  function scheduleAppointment() {
    const form = document.getElementById("newAppointmentForm")
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    // Get form data
    const formData = new FormData(form)
    const appointmentData = Object.fromEntries(formData)

    // Show loading state
    const submitBtn = event.target
    const originalText = submitBtn.innerHTML
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Scheduling...'
    submitBtn.disabled = true

    // Simulate API call
    setTimeout(() => {
      // Reset button
      submitBtn.innerHTML = originalText
      submitBtn.disabled = false

      // Close modal
      const modal = window.bootstrap.Modal.getInstance(document.getElementById("newAppointmentModal"))
      modal.hide()

      // Show success message
      showNotification("Appointment scheduled successfully!", "success")

      // Refresh calendar and schedule
      updateSchedule()
      generateCalendar()
    }, 2000)
  }

  function scheduleEmergencyAppointment() {
    const form = document.getElementById("emergencyScheduleForm")
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    // Show loading state
    const submitBtn = event.target
    const originalText = submitBtn.innerHTML
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Scheduling Emergency...'
    submitBtn.disabled = true

    // Simulate API call
    setTimeout(() => {
      // Reset button
      submitBtn.innerHTML = originalText
      submitBtn.disabled = false

      // Close modal
      const modal = window.bootstrap.Modal.getInstance(document.getElementById("emergencyScheduleModal"))
      modal.hide()

      // Show success message
      showNotification("Emergency appointment scheduled successfully!", "success")

      // Refresh schedule
      updateSchedule()
    }, 1500)
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

// Search Case by ID
function searchCase(caseId) {
  // Simulate case search
  window.showNotification("Searching for case...", "info")

  setTimeout(() => {
    // Mock case data
    const mockCaseData = {
      patientName: "Rajesh Kumar",
      patientPhone: "+91 9876543210",
      caseType: "vmer",
      priority: "high",
    }

    // Populate form fields
    document.getElementById("patientName").value = mockCaseData.patientName
    document.getElementById("patientPhone").value = mockCaseData.patientPhone
    document.getElementById("appointmentType").value = mockCaseData.caseType
    document.getElementById("priority").value = mockCaseData.priority

    window.showNotification("Case found and details populated!", "success")
  }, 1000)
}

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

// Declare showNotification function globally
window.showNotification = function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`
  notification.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 300px;"
  notification.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `

  document.body.appendChild(notification)

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove()
    }
  }, 5000)
}
