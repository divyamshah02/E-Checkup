document.addEventListener("DOMContentLoaded", () => {
  // Create mobile toggle button if it doesn't exist
  if (!document.querySelector(".mobile-sidebar-toggle")) {
    const toggleBtn = document.createElement("button")
    toggleBtn.className = "mobile-sidebar-toggle"
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>'
    toggleBtn.setAttribute("aria-label", "Toggle sidebar")
    document.body.appendChild(toggleBtn)
  }

  // Create backdrop if it doesn't exist
  if (!document.querySelector(".sidebar-backdrop")) {
    const backdrop = document.createElement("div")
    backdrop.className = "sidebar-backdrop"
    document.body.appendChild(backdrop)
  }

  const sidebar = document.querySelector(".sidebar")
  const backdrop = document.querySelector(".sidebar-backdrop")
  const toggleBtn = document.querySelector(".mobile-sidebar-toggle")

  function showSidebar() {
    sidebar.classList.add("show")
    backdrop.classList.add("show")
    document.body.style.overflow = "hidden"
  }

  function hideSidebar() {
    sidebar.classList.remove("show")
    backdrop.classList.remove("show")
    document.body.style.overflow = ""
  }

  // Toggle button click
  if (toggleBtn) {
    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (sidebar.classList.contains("show")) {
        hideSidebar()
      } else {
        showSidebar()
      }
    })
  }

  // Backdrop click to close
  if (backdrop) {
    backdrop.addEventListener("click", hideSidebar)
  }

  // Close sidebar when clicking nav links on mobile
  const navLinks = document.querySelectorAll(".nav-link")
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 1024) {
        hideSidebar()
      }
    })
  })

  // Close sidebar on window resize if screen becomes large
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) {
      hideSidebar()
    }
  })

  const tables = document.querySelectorAll(".table")
  tables.forEach((table) => {
    const cells = table.querySelectorAll("th, td")
    cells.forEach((cell) => {
      cell.style.whiteSpace = "nowrap"
    })
  })
})
