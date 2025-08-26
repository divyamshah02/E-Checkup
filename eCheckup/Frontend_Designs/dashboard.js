document.addEventListener("DOMContentLoaded", () => {
  // Mobile sidebar toggle
  const sidebarToggle = document.querySelector(".mobile-nav-toggle")
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

  // Navigation active state
  const navLinks = document.querySelectorAll(".nav-link")
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      if (this.getAttribute("href").startsWith("#")) {
        e.preventDefault()

        // Remove active class from all links
        navLinks.forEach((l) => l.classList.remove("active"))

        // Add active class to clicked link
        this.classList.add("active")

        // Load content based on href
        loadContent(this.getAttribute("href").substring(1))
      }
    })
  })

  // Auto-refresh stats every 30 seconds
  setInterval(updateStats, 30000)

  function updateStats() {
    // Simulate real-time updates
    const statsCards = document.querySelectorAll(".stats-card .h4")
    statsCards.forEach((card) => {
      const currentValue = Number.parseInt(card.textContent)
      const change = Math.floor(Math.random() * 5) - 2 // -2 to +2
      if (currentValue + change > 0) {
        card.textContent = currentValue + change
      }
    })
  }

  function loadContent(section) {
    // This would typically load content via AJAX
    console.log("Loading section:", section)

    // Show loading state
    const mainContent = document.querySelector(".main-content")
    // Implementation would go here
  }

  // Notification handling
  const notificationBadge = document.querySelector(".badge.bg-danger")
  if (notificationBadge) {
    // Simulate new notifications
    setInterval(() => {
      const currentCount = Number.parseInt(notificationBadge.textContent)
      if (Math.random() > 0.8) {
        // 20% chance of new notification
        notificationBadge.textContent = currentCount + 1
      }
    }, 60000) // Check every minute
  }
})
