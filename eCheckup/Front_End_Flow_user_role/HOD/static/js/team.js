// Mock data - In a real app, this would come from an API or a separate mock-data.js file
const teamMembers = [
  {
    id: "C001",
    name: "Dr. John Carter",
    email: "j.carter@echeckup.com",
    phone: "123-456-7890",
    role: "coordinator",
    department: "Medical",
    status: "active",
    casesAssigned: 15,
    performance: 92,
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    id: "C002",
    name: "Dr. Susan Lewis",
    email: "s.lewis@echeckup.com",
    phone: "123-456-7891",
    role: "coordinator",
    department: "Medical",
    status: "active",
    casesAssigned: 12,
    performance: 88,
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    id: "C003",
    name: "Dr. Peter Benton",
    email: "p.benton@echeckup.com",
    phone: "123-456-7892",
    role: "coordinator",
    department: "Operations",
    status: "inactive",
    casesAssigned: 8,
    performance: 76,
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    id: "T001",
    name: "Alice Johnson",
    email: "a.johnson@echeckup.com",
    phone: "987-654-3210",
    role: "telecaller",
    department: "Customer Service",
    status: "active",
    callsMade: 120,
    conversionRate: 75,
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    id: "T002",
    name: "Bob Williams",
    email: "b.williams@echeckup.com",
    phone: "987-654-3211",
    role: "telecaller",
    department: "Customer Service",
    status: "active",
    callsMade: 95,
    conversionRate: 68,
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    id: "T003",
    name: "Charlie Brown",
    email: "c.brown@echeckup.com",
    phone: "987-654-3212",
    role: "telecaller",
    department: "Customer Service",
    status: "active",
    callsMade: 150,
    conversionRate: 82,
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    id: "T004",
    name: "Diana Prince",
    email: "d.prince@echeckup.com",
    phone: "987-654-3213",
    role: "telecaller",
    department: "Customer Service",
    status: "inactive",
    callsMade: 80,
    conversionRate: 60,
    avatar: "/placeholder.svg?height=60&width=60",
  },
]

const coordinators = teamMembers.filter((m) => m.role === "coordinator")
const telecallers = teamMembers.filter((m) => m.role === "telecaller")

document.addEventListener("DOMContentLoaded", () => {
  // Initial render
  updateStats()
  renderLists()
  renderPerformance()
  setupEventListeners()
})

function setupEventListeners() {
  document.getElementById("coordinatorSearch").addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase()
    const listEl = document.getElementById("coordinatorsList")
    const filtered = coordinators.filter((c) => c.name.toLowerCase().includes(searchTerm))
    listEl.innerHTML = filtered.length
      ? filtered.map(renderMemberCard).join("")
      : '<p class="text-center text-muted w-100">No coordinators found.</p>'
  })

  document.getElementById("telecallerSearch").addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase()
    const listEl = document.getElementById("telecallersList")
    const filtered = telecallers.filter((t) => t.name.toLowerCase().includes(searchTerm))
    listEl.innerHTML = filtered.length
      ? filtered.map(renderMemberCard).join("")
      : '<p class="text-center text-muted w-100">No tele-callers found.</p>'
  })

  document.getElementById("exportTeamBtn").addEventListener("click", exportTeamData)

  const sidebarToggle = document.getElementById("sidebarToggle")
  const sidebar = document.getElementById("sidebar")
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active")
    })
  }
}

function renderMemberCard(member) {
  const statusClass = member.status === "active" ? "text-success" : "text-muted"
  const statusIcon = member.status === "active" ? "fa-check-circle" : "fa-times-circle"
  const performanceMetric =
    member.role === "coordinator"
      ? `<div class="small text-muted">Cases: ${member.casesAssigned}</div>`
      : `<div class="small text-muted">Calls: ${member.callsMade}</div>`

  return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card member-card h-100">
                <div class="card-body text-center">
                    <img src="${member.avatar}" alt="${member.name}" class="rounded-circle mb-3" width="60" height="60">
                    <h6 class="card-title mb-0">${member.name}</h6>
                    <p class="card-text text-muted small">${member.department} Dept.</p>
                    <div class="d-flex justify-content-center align-items-center small mb-3">
                        <i class="fas ${statusIcon} ${statusClass} me-1"></i>
                        <span class="${statusClass}">${member.status.charAt(0).toUpperCase() + member.status.slice(1)}</span>
                    </div>
                    ${performanceMetric}
                </div>
                <div class="card-footer bg-transparent d-flex justify-content-around">
                    <a href="mailto:${member.email}" class="btn btn-sm btn-outline-secondary" title="Email"><i class="fas fa-envelope"></i></a>
                    <a href="tel:${member.phone}" class="btn btn-sm btn-outline-secondary" title="Call"><i class="fas fa-phone"></i></a>
                    <button class="btn btn-sm btn-outline-secondary" onclick="viewMemberDetails('${member.id}')" title="View Details"><i class="fas fa-ellipsis-h"></i></button>
                </div>
            </div>
        </div>
    `
}

function renderLists() {
  const coordinatorListEl = document.getElementById("coordinatorsList")
  const telecallerListEl = document.getElementById("telecallersList")

  coordinatorListEl.innerHTML = coordinators.length
    ? coordinators.map(renderMemberCard).join("")
    : '<p class="text-center text-muted w-100">No coordinators found.</p>'
  telecallerListEl.innerHTML = telecallers.length
    ? telecallers.map(renderMemberCard).join("")
    : '<p class="text-center text-muted w-100">No tele-callers found.</p>'
}

function updateStats() {
  document.getElementById("totalMembersCount").textContent = teamMembers.length
  document.getElementById("coordinatorsCount").textContent = coordinators.length
  document.getElementById("telecallersCount").textContent = telecallers.length
  document.getElementById("activeTodayCount").textContent = teamMembers.filter((m) => m.status === "active").length
}

function renderPerformance() {
  const topPerformersEl = document.getElementById("topPerformers")
  const workloadChartEl = document.getElementById("workloadChart")

  // Top Performers
  const allPerformers = [...teamMembers]
    .sort((a, b) => {
      const perfA = a.performance || a.conversionRate || 0
      const perfB = b.performance || b.conversionRate || 0
      return perfB - perfA
    })
    .slice(0, 5)

  topPerformersEl.innerHTML = allPerformers
    .map(
      (p) => `
        <div class="d-flex align-items-center mb-3">
            <img src="${p.avatar.replace("60&width=60", "40&width=40")}" alt="${p.name}" class="rounded-circle me-3" width="40" height="40">
            <div class="flex-grow-1">
                <div class="fw-bold">${p.name}</div>
                <div class="text-muted small">${p.role.charAt(0).toUpperCase() + p.role.slice(1)}</div>
            </div>
            <div class="text-success fw-bold">${p.performance || p.conversionRate}%</div>
        </div>
    `,
    )
    .join("")

  // Workload Chart (simple bar representation)
  const totalWorkload = teamMembers.reduce((acc, member) => acc + (member.casesAssigned || member.callsMade || 0), 0)
  workloadChartEl.innerHTML = teamMembers
    .map((member) => {
      const workload = member.casesAssigned || member.callsMade || 0
      const percentage = totalWorkload > 0 ? Math.round((workload / totalWorkload) * 100) : 0
      return `
            <div class="mb-2">
                <div class="d-flex justify-content-between small mb-1">
                    <span>${member.name}</span>
                    <span>${workload} ${member.role === "coordinator" ? "cases" : "calls"}</span>
                </div>
                <div class="progress" style="height: 8px;">
                    <div class="progress-bar bg-primary" role="progressbar" style="width: ${percentage}%;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
        `
    })
    .join("")
}

// These functions are called from the HTML file directly
window.addMember = () => {
  const name = document.getElementById("memberName").value
  const email = document.getElementById("memberEmail").value
  const phone = document.getElementById("memberPhone").value
  const role = document.getElementById("memberRole").value
  const department = document.getElementById("memberDepartment").value

  if (name && email && phone && role) {
    console.log("Adding new member:", { name, email, phone, role, department })

    const modalEl = document.getElementById("addMemberModal")
    const modal = window.bootstrap.Modal.getInstance(modalEl)
    if (modal) {
      modal.hide()
    }

    document.getElementById("addMemberForm").reset()
    alert("New member added (see console). In a real app, the list would update automatically.")
  } else {
    alert("Please fill all required fields.")
  }
}

window.viewMemberDetails = (memberId) => {
  const member = teamMembers.find((m) => m.id === memberId)
  if (member) {
    alert(`Details for ${member.name}:\nEmail: ${member.email}\nPhone: ${member.phone}\nRole: ${member.role}`)
  } else {
    alert("Member not found.")
  }
}

function exportTeamData() {
  const headers = ["ID", "Name", "Email", "Phone", "Role", "Department", "Status"]
  const rows = teamMembers.map((member) =>
    [member.id, `"${member.name}"`, member.email, member.phone, member.role, member.department, member.status].join(
      ",",
    ),
  )

  const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n")

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", "echeckup_team_export.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
