// LIC Management JavaScript
let currentEntities = []
let filteredEntities = []
let currentPage = 1
const entitiesPerPage = 10
let currentFilter = "all"
let endpoints = {}
let csrfToken = ""
let editingEntityId = null
let currentEntityType = ""

// LIC Level Configuration
const LIC_LEVELS = {
  "head-office": {
    name: "Head Office",
    icon: "fas fa-building",
    color: "dark",
    parentField: null,
    hasContact: false,
    endpoint: "headOffice",
  },
  "regional-office": {
    name: "Regional Office",
    icon: "fas fa-city",
    color: "info",
    parentField: "head_office_id",
    hasContact: false,
    endpoint: "regionalOffice",
  },
  "divisional-office": {
    name: "Divisional Office",
    icon: "fas fa-store",
    color: "warning",
    parentField: "regional_office_id",
    hasContact: false,
    endpoint: "divisionalOffice",
  },
  "branch-office": {
    name: "Branch Office",
    icon: "fas fa-shop",
    color: "success",
    parentField: "divisional_office_id",
    hasContact: false,
    endpoint: "branchOffice",
  },
  "development-officer": {
    name: "Development Officer",
    icon: "fas fa-user-tie",
    color: "purple",
    parentField: "branch_office_id",
    hasContact: true,
    endpoint: "developmentOfficer",
  },
  agent: {
    name: "Agent",
    icon: "fas fa-user-check",
    color: "danger",
    parentField: "development_officer_id",
    hasContact: true,
    endpoint: "agent",
  },
}


// Initialize the LIC management page
async function InitializeLICManagement(token, apiEndpoints) {
  csrfToken = token
  endpoints = apiEndpoints

  setupEventListeners()
  await loadAllEntities()
}

function setupEventListeners() {
  // Search functionality
  document.getElementById("searchInput").addEventListener("input", () => {
    filterEntities()
  })

  // Filter dropdown
  document.querySelectorAll("[data-filter]").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault()
      currentFilter = this.dataset.filter
      filterEntities()
    })
  })

  // Create entity button
  document.getElementById("createEntityBtn").addEventListener("click", () => {
    if (editingEntityId) {
      updateEntity()
    } else {
      createEntity()
    }
  })

  // Refresh button
  document.getElementById("refreshBtn").addEventListener("click", () => {
    loadAllEntities()
  })

  // Stats card filters
  document.querySelectorAll(".stats-card[data-level]").forEach((card) => {
    card.addEventListener("click", function () {
      const level = this.dataset.level
      currentFilter = level
      filterEntities()

      // Update active state
      document.querySelectorAll(".stats-card").forEach((c) => c.classList.remove("active"))
      this.classList.add("active")
    })
  })
}

async function loadAllEntities() {
  try {
    currentEntities = []

    // Load all entity types
    for (const [levelKey, config] of Object.entries(LIC_LEVELS)) {
      const [success, data] = await callApi("GET", endpoints[config.endpoint], null, csrfToken)

      if (success && data.success) {
        const entities = (data.data || []).map((entity) => ({
          ...entity,
          entityType: levelKey,
          levelName: config.name,
          levelIcon: config.icon,
          levelColor: config.color,
        }))
        currentEntities.push(...entities)
      }
    }

    updateEntityStats()
    filterEntities()
  } catch (error) {
    console.error("Error loading entities:", error)
    showAlert("Error loading LIC entities", "danger")
  }
}

function updateEntityStats() {
  const stats = {
    total: currentEntities.length,
    "head-office": currentEntities.filter((e) => e.entityType === "head-office").length,
    "regional-office": currentEntities.filter((e) => e.entityType === "regional-office").length,
    "divisional-office": currentEntities.filter((e) => e.entityType === "divisional-office").length,
    "branch-office": currentEntities.filter((e) => e.entityType === "branch-office").length,
    "development-officer": currentEntities.filter((e) => e.entityType === "development-officer").length,
    agent: currentEntities.filter((e) => e.entityType === "agent").length,
  }

  document.getElementById("total-entities").textContent = stats.total
  document.getElementById("head-office-count").textContent = stats["head-office"]
  document.getElementById("regional-office-count").textContent = stats["regional-office"]
  document.getElementById("divisional-office-count").textContent = stats["divisional-office"]
  document.getElementById("branch-office-count").textContent = stats["branch-office"]
  document.getElementById("development-officer-count").textContent = stats["development-officer"]
  document.getElementById("agent-count").textContent = stats["agent"]
}

function filterEntities() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase()

  filteredEntities = currentEntities.filter((entity) => {
    const matchesSearch =
      !searchTerm ||
      entity.name.toLowerCase().includes(searchTerm) ||
      entity.lic_id.toLowerCase().includes(searchTerm) ||
      (entity.address && entity.address.toLowerCase().includes(searchTerm))

    const matchesFilter = currentFilter === "all" || entity.entityType === currentFilter

    return matchesSearch && matchesFilter
  })

  currentPage = 1
  renderEntitiesTable()
  renderPagination()
}

function renderEntitiesTable() {
  const tbody = document.getElementById("entities-table-body")
  const startIndex = (currentPage - 1) * entitiesPerPage
  const endIndex = startIndex + entitiesPerPage
  const pageEntities = filteredEntities.slice(startIndex, endIndex)

  tbody.innerHTML = pageEntities
    .map(
      (entity) => `
            <tr>
                <td>
                    <span class="fw-semibold">${entity.lic_id}</span>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="${entity.levelIcon} text-${entity.levelColor} me-2"></i>
                        <span class="fw-medium">${entity.name}</span>
                    </div>
                </td>
                <td>
                    <span class="badge bg-${entity.levelColor}">${entity.levelName}</span>
                </td>
                <td>${getParentInfo(entity)}</td>
                <td>${getAddressOrContact(entity)}</td>
                <td class="text-nowrap">${formatDate(entity.created_at)}</td>
                <td class="text-end">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editEntity('${entity.entityType}', ${entity.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteEntity('${entity.entityType}', ${entity.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `,
    )
    .join("")

  // Update pagination info
  document.getElementById("showing-start").textContent = startIndex + 1
  document.getElementById("showing-end").textContent = Math.min(endIndex, filteredEntities.length)
  document.getElementById("total-records").textContent = filteredEntities.length
}

function getParentInfo(entity) {
  const config = LIC_LEVELS[entity.entityType]
  if (!config.parentField) return '<span class="text-muted">Root Level</span>'

  const parentId = entity[config.parentField]
  if (!parentId) return '<span class="text-muted">No Parent</span>'

  return `<span class="text-muted small">${parentId}</span>`
}

function getAddressOrContact(entity) {
  if (entity.contact_number) {
    return `<div>
            <i class="fas fa-phone text-muted me-1"></i>
            <span>${entity.contact_number}</span>
        </div>`
  }

  if (entity.address) {
    return `<div class="text-truncate" style="max-width: 200px;" title="${entity.address}">
            <i class="fas fa-map-marker-alt text-muted me-1"></i>
            <span>${entity.address}</span>
        </div>`
  }

  return '<span class="text-muted">N/A</span>'
}

function renderPagination() {
  const totalPages = Math.ceil(filteredEntities.length / entitiesPerPage)
  const pagination = document.getElementById("pagination-controls")

  if (totalPages <= 1) {
    pagination.innerHTML = ""
    return
  }

  let paginationHTML = ""

  // Previous button
  paginationHTML += `
        <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
        </li>
    `

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      paginationHTML += `
                <li class="page-item ${i === currentPage ? "active" : ""}">
                    <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                </li>
            `
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>'
    }
  }

  // Next button
  paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
        </li>
    `

  pagination.innerHTML = paginationHTML
}

function changePage(page) {
  const totalPages = Math.ceil(filteredEntities.length / entitiesPerPage)
  if (page >= 1 && page <= totalPages) {
    currentPage = page
    renderEntitiesTable()
    renderPagination()
  }
}

async function openCreateModal(entityType) {
  currentEntityType = entityType
  const config = LIC_LEVELS[entityType]

  // Update modal title
  document.querySelector("#createEntityModal .modal-title").textContent = `Create ${config.name}`

  // Show/hide fields based on entity type
  toggleEntityFields(entityType)

  // Load parent options if needed
  if (config.parentField) {
    await loadParentOptions(entityType)
  }

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("createEntityModal"))
  modal.show()
}

function toggleEntityFields(entityType) {
  const config = LIC_LEVELS[entityType]

  // Parent selection
  const parentSelection = document.getElementById("parentSelection")
  parentSelection.style.display = config.parentField ? "block" : "none"

  // Contact field
  const contactField = document.getElementById("contactField")
  contactField.style.display = config.hasContact ? "block" : "none"

  // Address field (always show for offices, hide for officers/agents with contact)
  const addressField = document.getElementById("addressField")
  addressField.style.display = config.hasContact ? "none" : "block"
}

async function loadParentOptions(entityType) {
  const config = LIC_LEVELS[entityType]
  const parentSelect = document.getElementById("parentEntity")

  // Determine parent entity type
  const parentTypes = {
    "regional-office": "head-office",
    "divisional-office": "regional-office",
    "branch-office": "divisional-office",
    "development-officer": "branch-office",
    agent: "development-officer",
  }

  const parentType = parentTypes[entityType]
  if (!parentType) return

  const parentConfig = LIC_LEVELS[parentType]
  const [success, data] = await callApi("GET", endpoints[parentConfig.endpoint], null, csrfToken)

  if (success && data.success) {
    const options = data.data
      .map((entity) => `<option value="${entity.lic_id}">${entity.lic_id} - ${entity.name}</option>`)
      .join("")

    parentSelect.innerHTML = `<option value="">Select ${parentConfig.name}</option>` + options
  }
}

async function createEntity() {
  const config = LIC_LEVELS[currentEntityType]

  // Get form data
  const licId = document.getElementById("entityLicId").value.trim()
  const name = document.getElementById("entityName").value.trim()
  const address = document.getElementById("entityAddress").value.trim()
  const contact = document.getElementById("entityContact").value.trim()
  const parentId = document.getElementById("parentEntity").value

  // Basic validation
  if (!licId || !name) {
    showAlert("Please fill in all required fields", "warning")
    return
  }

  if (config.parentField && !parentId) {
    showAlert(
      `Please select a parent ${LIC_LEVELS[Object.keys(LIC_LEVELS).find((k) => LIC_LEVELS[k].endpoint === config.endpoint.replace(/([A-Z])/g, "-$1").toLowerCase())].name}`,
      "warning",
    )
    return
  }

  try {
    const payload = {
      lic_id: licId,
      name: name,
    }

    // Add parent field if needed
    if (config.parentField && parentId) {
      payload[config.parentField] = parentId
    }

    // Add address or contact
    if (config.hasContact && contact) {
      payload.contact_number = contact
    } else if (address) {
      payload.address = address
    }

    const [success, result] = await callApi("POST", endpoints[config.endpoint], payload, csrfToken)

    if (success && result.success) {
      showAlert(`${config.name} created successfully`, "success")

      // Close modal and reset form
      const modal = bootstrap.Modal.getInstance(document.getElementById("createEntityModal"))
      modal.hide()
      resetForm()

      // Reload entities
      await loadAllEntities()
    } else {
      showAlert(`Failed to create ${config.name}: ${result.error || "Unknown error"}`, "danger")
    }
  } catch (error) {
    console.error("Error creating entity:", error)
    showAlert(`Error creating ${config.name}`, "danger")
  }
}

async function editEntity(entityType, entityId) {
  const entity = currentEntities.find((e) => e.entityType === entityType && e.id === entityId)
  if (!entity) {
    showAlert("Entity not found", "danger")
    return
  }

  currentEntityType = entityType
  editingEntityId = entityId
  const config = LIC_LEVELS[entityType]

  // Update modal title and button
  document.querySelector("#createEntityModal .modal-title").textContent = `Edit ${config.name}`
  document.getElementById("createEntityBtn").textContent = `Update ${config.name}`

  // Show/hide fields
  toggleEntityFields(entityType)

  // Load parent options if needed
  if (config.parentField) {
    await loadParentOptions(entityType)
  }

  // Populate form
  document.getElementById("entityLicId").value = entity.lic_id
  document.getElementById("entityName").value = entity.name
  document.getElementById("entityAddress").value = entity.address || ""
  document.getElementById("entityContact").value = entity.contact_number || ""

  if (config.parentField) {
    document.getElementById("parentEntity").value = entity[config.parentField] || ""
  }

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("createEntityModal"))
  modal.show()
}

async function updateEntity() {
  const config = LIC_LEVELS[currentEntityType]

  // Get form data
  const licId = document.getElementById("entityLicId").value.trim()
  const name = document.getElementById("entityName").value.trim()
  const address = document.getElementById("entityAddress").value.trim()
  const contact = document.getElementById("entityContact").value.trim()
  const parentId = document.getElementById("parentEntity").value

  // Basic validation
  if (!licId || !name) {
    showAlert("Please fill in all required fields", "warning")
    return
  }

  try {
    const payload = {
      lic_id: licId,
      name: name,
    }

    // Add parent field if needed
    if (config.parentField && parentId) {
      payload[config.parentField] = parentId
    }

    // Add address or contact
    if (config.hasContact && contact) {
      payload.contact_number = contact
    } else if (address) {
      payload.address = address
    }

    const [success, result] = await callApi(
      "PUT",
      `${endpoints[config.endpoint]}${editingEntityId}/`,
      payload,
      csrfToken,
    )

    if (success && result.success) {
      showAlert(`${config.name} updated successfully`, "success")

      // Close modal and reset form
      const modal = bootstrap.Modal.getInstance(document.getElementById("createEntityModal"))
      modal.hide()
      resetForm()

      // Reload entities
      await loadAllEntities()
    } else {
      showAlert(`Failed to update ${config.name}: ${result.error || "Unknown error"}`, "danger")
    }
  } catch (error) {
    console.error("Error updating entity:", error)
    showAlert(`Error updating ${config.name}`, "danger")
  }
}

async function deleteEntity(entityType, entityId) {
  const config = LIC_LEVELS[entityType]

  if (!confirm(`Are you sure you want to delete this ${config.name}? This action cannot be undone.`)) {
    return
  }

  try {
    const [success, result] = await callApi("DELETE", `${endpoints[config.endpoint]}${entityId}/`, null, csrfToken)

    if (success && result.success) {
      showAlert(`${config.name} deleted successfully`, "success")
      await loadAllEntities()
    } else {
      showAlert(`Failed to delete ${config.name}: ${result.error || "Unknown error"}`, "danger")
    }
  } catch (error) {
    console.error("Error deleting entity:", error)
    showAlert(`Error deleting ${config.name}`, "danger")
  }
}

function resetForm() {
  const form = document.getElementById("createEntityForm")
  form.reset()
  editingEntityId = null
  currentEntityType = ""

  // Reset modal title and button
  document.querySelector("#createEntityModal .modal-title").textContent = "Create New Entity"
  document.getElementById("createEntityBtn").textContent = "Create Entity"
}

// Add event listener to reset form when modal is hidden
document.getElementById("createEntityModal").addEventListener("hidden.bs.modal", resetForm)

// Utility functions
function formatDate(dateString) {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function showAlert(message, type) {
  // Create alert element
  const alertDiv = document.createElement("div")
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`
  alertDiv.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 300px;"
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `

  document.body.appendChild(alertDiv)

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove()
    }
  }, 5000)
}
