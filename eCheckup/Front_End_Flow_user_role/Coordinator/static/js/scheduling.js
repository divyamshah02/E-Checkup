document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("coordinatorMockData"))
  if (!data) {
    console.error("Coordinator mock data not found in localStorage.")
    return
  }

  const calendarBody = document.getElementById("calendar-body")
  const monthYearEl = document.getElementById("month-year")
  const prevMonthBtn = document.getElementById("prev-month")
  const nextMonthBtn = document.getElementById("next-month")
  const todayBtn = document.getElementById("today-btn")

  let currentDate = new Date()

  function renderCalendar() {
    calendarBody.innerHTML = ""
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    monthYearEl.textContent = `${currentDate.toLocaleString("default", { month: "long" })} ${year}`

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Add empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      calendarBody.innerHTML += `<div class="calendar-day other-month"></div>`
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEl = document.createElement("div")
      dayEl.className = "calendar-day"
      const today = new Date()
      if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        dayEl.classList.add("today")
      }

      dayEl.innerHTML = `<div class="day-number">${day}</div>`

      // Find events for this day
      const currentDayDate = new Date(year, month, day)
      const events = findEventsForDate(currentDayDate)
      events.forEach((event) => {
        const eventEl = document.createElement("div")
        eventEl.className = `calendar-event event-${event.type}`
        eventEl.textContent = event.title
        dayEl.appendChild(eventEl)
      })

      calendarBody.appendChild(dayEl)
    }
  }

  function findEventsForDate(date) {
    const events = []
    const dateString = date.toISOString().split("T")[0]

    data.cases.forEach((c) => {
      // Check for appointments
      if (c.appointmentDate === dateString) {
        let eventType = ""
        switch (c.caseType) {
          case "VMER":
            eventType = "vmer"
            break
          case "DC Visit":
            eventType = "dc-visit"
            break
          case "Online":
            eventType = "online"
            break
        }
        events.push({
          type: eventType,
          title: `${c.caseType}: ${c.policyHolder}`,
        })
      }

      // Check for SLA deadlines
      if (c.slaDaysLeft !== null) {
        const assignedDate = new Date(c.assignedOn)
        const slaDate = new Date(assignedDate.setDate(assignedDate.getDate() + c.slaDaysLeft + 1))
        if (slaDate.toISOString().split("T")[0] === dateString) {
          events.push({
            type: "sla",
            title: `SLA Due: ${c.caseId}`,
          })
        }
      }
    })
    return events
  }

  prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1)
    renderCalendar()
  })

  nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1)
    renderCalendar()
  })

  todayBtn.addEventListener("click", () => {
    currentDate = new Date()
    renderCalendar()
  })

  renderCalendar()
})
