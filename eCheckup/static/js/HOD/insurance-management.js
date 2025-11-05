let currentEntities = []
let filteredEntities = []
let currentPage = 1
const entitiesPerPage = 10
let currentFilter = "all"
let endpoints = {}
let csrfToken = ""
let editingEntityId = null
let currentEntityType = ""
let selectedInsuranceCompany = null
let insuranceCompanies = []

const LIC_LEVELS = {
  "head-office": {
    name: "Head Office",
    icon: "fas fa-building",
    color: "dark",
    parentField: null,
    hasContact: false,
    endpoint: "headOffice",
    isUser: false,
  },
  "regional-office": {
    name: "Regional Office",
    icon: "fas fa-city",
    color: "info",
    parentField: "head_office_id",
    hasContact: false,
    endpoint: "regionalOffice",
    isUser: false,
  },
  "divisional-office": {
    name: "Divisional Office",
    icon: "fas fa-store",
    color: "warning",
    parentField: "regional_office_id",
    hasContact: false,
    endpoint: "divisionalOffice",
    isUser: false,
  },
  "branch-office": {
    name: "Branch Office",
    icon: "fas fa-shop",
    color: "success",
    parentField: "divisional_office_id",
    hasContact: false,
    endpoint: "branchOffice",
    isUser: false,
  },
  "development-officer": {
    name: "Development Officer",
    icon: "fas fa-user-tie",
    color: "purple",
    parentField: "branch_office_id",
    hasContact: true,
    endpoint: "developmentOfficer",
    isUser: false,
  },
  agent: {
    name: "Agent",
    icon: "fas fa-user-check",
    color: "danger",
    parentField: "development_officer_id",
    hasContact: true,
    endpoint: "agent",
    isUser: true,
  },
}

const TATA_AIG_LEVELS = {
  "tata-aig-office": {
    name: "Office",
    icon: "fas fa-building",
    color: "primary",
    parentField: null,
    hasContact: false,
    endpoint: "tataAigOffices",
    isUser: false,
    isTataAig: true,
  },
}

async function InitializeInsuranceManagement(token, apiEndpoints) {
  csrfToken = token
  endpoints = apiEndpoints

  await loadInsuranceCompanies()
  setupEventListeners()
}

async function loadInsuranceCompanies() {
  try {
    const [success, data] = await callApi("GET", endpoints.insuranceCompanies, null, csrfToken)

    if (success && data.success) {
      insuranceCompanies = data.data || []
      const select = document.getElementById("insuranceCompanySelect")

      select.innerHTML = insuranceCompanies
        .map((company) => `<option value="${company.id}">${company.name}</option>`)
        .join("")

      const licCompany = insuranceCompanies.find((c) => c.name === "LIC")
      if (licCompany) {
        select.value = licCompany.id
        selectedInsuranceCompany = licCompany
      } else if (insuranceCompanies.length > 0) {
        selectedInsuranceCompany = insuranceCompanies[0]
      }

      updateUIForInsuranceCompany()
      await loadAllEntities()
    }
  } catch (error) {
    console.error("Error loading insurance companies:", error)
    showAlert("Error loading insurance companies", "danger")
  }
}

function setupEventListeners() {
  document.getElementById("insuranceCompanySelect").addEventListener("change", async function () {
    const companyId = Number.parseInt(this.value)
    selectedInsuranceCompany = insuranceCompanies.find((c) => c.id === companyId)
    updateUIForInsuranceCompany()
    await loadAllEntities()
  })

  document.getElementById("searchInput").addEventListener("input", () => {
    filterEntities()
  })

  document.querySelectorAll("[data-filter]").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault()
      currentFilter = this.dataset.filter
      filterEntities()
    })
  })

  document.getElementById("createEntityBtn").addEventListener("click", () => {
    if (editingEntityId) {
      updateEntity()
    } else {
      createEntity()
    }
  })

  document.querySelectorAll(".stats-card[data-level]").forEach((card) => {
    card.addEventListener("click", function () {
      const level = this.dataset.level
      currentFilter = level
      filterEntities()

      document.querySelectorAll(".stats-card").forEach((c) => c.classList.remove("active"))
      this.classList.add("active")
    })
  })
}

function updateUIForInsuranceCompany() {
  if (!selectedInsuranceCompany) return

  const createDropdown = document.getElementById("createDropdownMenu")
  const filterDropdown = document.getElementById("filterDropdownMenu")

  if (selectedInsuranceCompany.has_hierarchy) {
    createDropdown.innerHTML = `
      <li><a class="dropdown-item" href="#" onclick="openCreateModal('head-office')">
        <i class="fas fa-building text-primary"></i> Head Office
      </a></li>
      <li><a class="dropdown-item" href="#" onclick="openCreateModal('regional-office')">
        <i class="fas fa-city text-info"></i> Regional Office
      </a></li>
      <li><a class="dropdown-item" href="#" onclick="openCreateModal('divisional-office')">
        <i class="fas fa-store text-warning"></i> Divisional Office
      </a></li>
      <li><a class="dropdown-item" href="#" onclick="openCreateModal('branch-office')">
        <i class="fas fa-shop text-success"></i> Branch Office
      </a></li>
      <li><a class="dropdown-item" href="#" onclick="openCreateModal('development-officer')">
        <i class="fas fa-user-tie text-purple"></i> Development Officer
      </a></li>
      <li><a class="dropdown-item" href="#" onclick="openCreateModal('agent')">
        <i class="fas fa-user-check text-danger"></i> Agent
      </a></li>
    `

    filterDropdown.innerHTML = `
      <li><a class="dropdown-item" href="#" data-filter="all">All Levels</a></li>
      <li><hr class="dropdown-divider"></li>
      <li><a class="dropdown-item" href="#" data-filter="head-office">Head Offices</a></li>
      <li><a class="dropdown-item" href="#" data-filter="regional-office">Regional Offices</a></li>
      <li><a class="dropdown-item" href="#" data-filter="divisional-office">Divisional Offices</a></li>
      <li><a class="dropdown-item" href="#" data-filter="branch-office">Branch Offices</a></li>
      <li><a class="dropdown-item" href="#" data-filter="development-officer">Development Officers</a></li>
      <li><a class="dropdown-item" href="#" data-filter="agent">Agents</a></li>
    `
  } else {
    createDropdown.innerHTML = `
      <li><a class="dropdown-item" href="#" onclick="openCreateModal('tata-aig-office')">
        <i class="fas fa-building text-primary"></i> Office
      </a></li>
    `

    filterDropdown.innerHTML = `
      <li><a class="dropdown-item" href="#" data-filter="all">All Offices</a></li>
      <li><hr class="dropdown-divider"></li>
      <li><a class="dropdown-item" href="#" data-filter="tata-aig-office">Offices</a></li>
    `
  }

  document.querySelectorAll("[data-filter]").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault()
      currentFilter = this.dataset.filter
      filterEntities()
    })
  })
}

async function loadAllEntities() {
  try {
    currentEntities = []

    if (selectedInsuranceCompany.has_hierarchy) {
      for (const [levelKey, config] of Object.entries(LIC_LEVELS)) {
        const apiUrl = endpoints[config.endpoint]
        let apiPayload = null

        if (config.isUser) {
          apiPayload = { role: "Agent" }
        }

        const [success, data] = await callApi("GET", apiUrl, apiPayload, csrfToken)

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
    } else {
      const [success, data] = await callApi("GET", endpoints.tataAigOffices, null, csrfToken)

      if (success && data.success) {
        const entities = (data.data || []).map((entity) => ({
          ...entity,
          entityType: "tata-aig-office",
          levelName: "Office",
          levelIcon: "fas fa-building",
          levelColor: "primary",
        }))
        currentEntities.push(...entities)
      }
    }

    updateEntityStats()
    filterEntities()
  } catch (error) {
    console.error("Error loading entities:", error)
    showAlert("Error loading insurance entities", "danger")
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
    const entityId = entity.lic_id || entity.code || entity.id
    const matchesSearch =
      !searchTerm ||
      entity.name.toLowerCase().includes(searchTerm) ||
      (entityId && entityId.toString().toLowerCase().includes(searchTerm)) ||
      (entity.address && entity.address.toLowerCase().includes(searchTerm)) ||
      (entity.city && entity.city.toLowerCase().includes(searchTerm)) ||
      (entity.state && entity.state.toLowerCase().includes(searchTerm))

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
    .map((entity) => {
      const entityId = entity.lic_id || entity.code || entity.id
      return `
        <tr>
          <td><span class="fw-semibold">${entityId}</span></td>
          <td>
            <div class="d-flex align-items-center">
              <i class="${entity.levelIcon} text-${entity.levelColor} me-2"></i>
              <span class="fw-medium">${entity.name}</span>
            </div>
          </td>
          <td><span class="badge bg-${entity.levelColor}">${entity.levelName}</span></td>
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
      `
    })
    .join("")

  document.getElementById("showing-start").textContent = startIndex + 1
  document.getElementById("showing-end").textContent = Math.min(endIndex, filteredEntities.length)
  document.getElementById("total-records").textContent = filteredEntities.length
}

function getParentInfo(entity) {
  const config = LIC_LEVELS[entity.entityType] || TATA_AIG_LEVELS[entity.entityType]
  if (!config.parentField) return '<span class="text-muted">Root Level</span>'

  const parentId = entity[config.parentField]
  if (!parentId) return '<span class="text-muted">No Parent</span>'

  return `<span class="text-muted small">${parentId}</span>`
}

function getAddressOrContact(entity) {
  if (entity.contact_number) {
    return `<div><i class="fas fa-phone text-muted me-1"></i><span>${entity.contact_number}</span></div>`
  }

  if (entity.city && entity.state) {
    return `<div class="text-truncate" style="max-width: 200px;" title="${entity.city}, ${entity.state} - ${entity.pincode || ""}">
      <i class="fas fa-map-marker-alt text-muted me-1"></i><span>${entity.city}, ${entity.state}</span>
    </div>`
  }

  if (entity.address) {
    return `<div class="text-truncate" style="max-width: 200px;" title="${entity.address}">
      <i class="fas fa-map-marker-alt text-muted me-1"></i><span>${entity.address}</span>
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

  let paginationHTML = `
    <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
      <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
    </li>
  `

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
  const config = LIC_LEVELS[entityType] || TATA_AIG_LEVELS[entityType]

  document.querySelector("#createEntityModal .modal-title").textContent = `Create ${config.name}`

  toggleEntityFields(entityType)

  if (config.parentField) {
    await loadParentOptions(entityType)
  }

  const modal = window.bootstrap.Modal.getOrCreateInstance(document.getElementById("createEntityModal"))
  modal.show()
}

function toggleEntityFields(entityType) {
  const config = LIC_LEVELS[entityType] || TATA_AIG_LEVELS[entityType]

  const tataAigFields = document.getElementById("tataAigFields")
  tataAigFields.style.display = config.isTataAig ? "block" : "none"

  const parentSelection = document.getElementById("parentSelection")
  parentSelection.style.display = config.parentField ? "block" : "none"

  const contactField = document.getElementById("contactField")
  contactField.style.display = config.hasContact ? "block" : "none"

  const addressField = document.getElementById("addressField")
  addressField.style.display = config.hasContact || config.isTataAig ? "none" : "block"

  const userFields = document.getElementById("userFields")
  userFields.style.display = config.isUser ? "block" : "none"
}

async function loadParentOptions(entityType) {
  const config = LIC_LEVELS[entityType]
  const parentSelect = document.getElementById("parentEntity")

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
  const config = LIC_LEVELS[currentEntityType] || TATA_AIG_LEVELS[currentEntityType]

  const name = document.getElementById("entityName").value.trim()
  const address = document.getElementById("entityAddress").value.trim()
  const contact = document.getElementById("entityContact").value.trim()
  const parentId = document.getElementById("parentEntity").value
  const email = document.getElementById("entityEmail").value.trim()
  const password = document.getElementById("entityPassword").value.trim()

  if (!name) {
    showAlert("Please fill in all required fields", "warning")
    return
  }

  if (config.isTataAig) {
    const code = document.getElementById("entityCode").value.trim()
    const city = document.getElementById("entityCity").value.trim()
    const state = document.getElementById("entityState").value.trim()
    const pincode = document.getElementById("entityPincode").value.trim()

    if (!code || !city || !state || !pincode) {
      showAlert("Please fill in all required fields (Code, City, State, Pincode)", "warning")
      return
    }

    const payload = {
      name: name,
      code: code,
      city: city,
      state: state,
      pincode: pincode,
    }

    const [success, result] = await callApi("POST", endpoints[config.endpoint], payload, csrfToken)

    if (success && result.success) {
      showAlert(`${config.name} created successfully`, "success")

      const modal = window.bootstrap.Modal.getOrCreateInstance(document.getElementById("createEntityModal"))
      modal.hide()
      resetForm()

      await loadAllEntities()
    } else {
      showAlert(`Failed to create ${config.name}: ${result.error || "Unknown error"}`, "danger")
    }
    return
  }

  if (config.isUser && (!email || !password || !contact)) {
    showAlert("Please fill in name, email, password, and contact number for agents", "warning")
    return
  }

  if (config.parentField && !parentId) {
    showAlert(`Please select a parent entity`, "warning")
    return
  }

  try {
    const payload = { name: name }

    if (config.isUser) {
      payload.email = email
      payload.password = password
      payload.contact_number = contact
      payload.role = "Agent"

      if (config.parentField && parentId) {
        payload[config.parentField] = parentId
      }
    } else {
      if (config.parentField && parentId) {
        payload[config.parentField] = parentId
      }

      if (config.hasContact && contact) {
        payload.contact_number = contact
      } else if (address) {
        payload.address = address
      }
    }

    const [success, result] = await callApi("POST", endpoints[config.endpoint], payload, csrfToken)

    if (success && result.success) {
      showAlert(`${config.name} created successfully`, "success")

      const modal = window.bootstrap.Modal.getOrCreateInstance(document.getElementById("createEntityModal"))
      modal.hide()
      resetForm()

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
  const config = LIC_LEVELS[entityType] || TATA_AIG_LEVELS[entityType]

  document.querySelector("#createEntityModal .modal-title").textContent = `Edit ${config.name}`
  document.getElementById("createEntityBtn").textContent = `Update ${config.name}`

  toggleEntityFields(entityType)

  if (config.parentField) {
    await loadParentOptions(entityType)
  }

  document.getElementById("entityName").value = entity.name

  if (config.isTataAig) {
    document.getElementById("entityCode").value = entity.code || ""
    document.getElementById("entityCity").value = entity.city || ""
    document.getElementById("entityState").value = entity.state || ""
    document.getElementById("entityPincode").value = entity.pincode || ""
  } else {
    document.getElementById("entityAddress").value = entity.address || ""
    document.getElementById("entityContact").value = entity.contact_number || ""
  }

  if (config.isUser) {
    document.getElementById("entityEmail").value = entity.email || ""
    document.getElementById("entityPassword").value = ""
  }

  if (config.parentField) {
    document.getElementById("parentEntity").value = entity[config.parentField] || ""
  }

  const modal = window.bootstrap.Modal.getOrCreateInstance(document.getElementById("createEntityModal"))
  modal.show()
}

async function updateEntity() {
  const config = LIC_LEVELS[currentEntityType] || TATA_AIG_LEVELS[currentEntityType]

  const name = document.getElementById("entityName").value.trim()
  const address = document.getElementById("entityAddress").value.trim()
  const contact = document.getElementById("entityContact").value.trim()
  const parentId = document.getElementById("parentEntity").value
  const email = document.getElementById("entityEmail").value.trim()
  const password = document.getElementById("entityPassword").value.trim()

  if (!name) {
    showAlert("Please fill in all required fields", "warning")
    return
  }

  if (config.isTataAig) {
    const code = document.getElementById("entityCode").value.trim()
    const city = document.getElementById("entityCity").value.trim()
    const state = document.getElementById("entityState").value.trim()
    const pincode = document.getElementById("entityPincode").value.trim()

    if (!code || !city || !state || !pincode) {
      showAlert("Please fill in all required fields (Code, City, State, Pincode)", "warning")
      return
    }

    const payload = {
      name: name,
      code: code,
      city: city,
      state: state,
      pincode: pincode,
    }

    const [success, result] = await callApi(
      "PUT",
      `${endpoints[config.endpoint]}${editingEntityId}/`,
      payload,
      csrfToken,
    )

    if (success && result.success) {
      showAlert(`${config.name} updated successfully`, "success")

      const modal = window.bootstrap.Modal.getOrCreateInstance(document.getElementById("createEntityModal"))
      modal.hide()
      resetForm()

      await loadAllEntities()
    } else {
      showAlert(`Failed to update ${config.name}: ${result.error || "Unknown error"}`, "danger")
    }
    return
  }

  if (config.isUser && (!email || !contact)) {
    showAlert("Please fill in name, email, and contact number for agents", "warning")
    return
  }

  try {
    const payload = { name: name }

    if (config.isUser) {
      payload.email = email
      payload.contact_number = contact
      payload.role = "Agent"

      if (password) {
        payload.password = password
      }

      if (config.parentField && parentId) {
        payload[config.parentField] = parentId
      }
    } else {
      if (config.parentField && parentId) {
        payload[config.parentField] = parentId
      }

      if (config.hasContact && contact) {
        payload.contact_number = contact
      } else if (address) {
        payload.address = address
      }
    }

    const [success, result] = await callApi(
      "PUT",
      `${endpoints[config.endpoint]}${editingEntityId}/`,
      payload,
      csrfToken,
    )

    if (success && result.success) {
      showAlert(`${config.name} updated successfully`, "success")

      const modal = window.bootstrap.Modal.getOrCreateInstance(document.getElementById("createEntityModal"))
      modal.hide()
      resetForm()

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
  const config = LIC_LEVELS[entityType] || TATA_AIG_LEVELS[entityType]

  if (!confirm(`Are you sure you want to delete this ${config.name}? This action cannot be undone.`)) {
    return
  }

  try {
    let deletePayload = null
    if (config.isUser) {
      deletePayload = { role: "Agent" }
    }

    const [success, result] = await callApi(
      "DELETE",
      `${endpoints[config.endpoint]}${entityId}/`,
      deletePayload,
      csrfToken,
    )

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

  document.querySelector("#createEntityModal .modal-title").textContent = "Create New Entity"
  document.getElementById("createEntityBtn").textContent = "Create Entity"
}

document.getElementById("createEntityModal").addEventListener("hidden.bs.modal", resetForm)

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
  const alertDiv = document.createElement("div")
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`
  alertDiv.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 300px;"
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
