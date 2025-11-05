let currentInsuranceCompany = null
let insuranceCompanies = []
let allFinanceData = null

async function InitializeFinanceInsurance(csrfToken, urls) {
  setupFinanceFilters("finance")

  // Load insurance companies
  await loadInsuranceCompanies(urls.insuranceCompaniesApi)

  document.getElementById("insuranceCompany").addEventListener("change", async () => {
    currentInsuranceCompany = insuranceCompanies.find((c) => c.id == document.getElementById("insuranceCompany").value)
    await handleInsuranceCompanyChange(urls)
  })

  document.getElementById("financeOfficeType").addEventListener("change", () => {
    updateOfficeDropdownFromData()
    renderFilteredFinanceData()
  })

  document.getElementById("financeOffice").addEventListener("change", () => {
    renderFilteredFinanceData()
  })

  document.getElementById("applyFinanceFilter").addEventListener("click", () => {
    loadFinanceData(urls.financeApi, csrfToken)
  })

  // Initial load after companies are loaded
  if (currentInsuranceCompany) {
    await handleInsuranceCompanyChange(urls)
    await loadFinanceData(urls.financeApi, csrfToken)
  }
}

async function loadInsuranceCompanies(apiUrl) {
  const [success, result] = await callApi("GET", apiUrl)
  if (!success || !result.success) {
    alert("Failed to load insurance companies")
    return
  }

  insuranceCompanies = result.data
  const select = document.getElementById("insuranceCompany")
  select.innerHTML = ""

  const licCompany = insuranceCompanies.find((c) => c.name.toLowerCase().includes("lic"))

  insuranceCompanies.forEach((company) => {
    const option = document.createElement("option")
    option.value = company.id
    option.textContent = company.name
    if (licCompany && company.id === licCompany.id) {
      option.selected = true
    }
    select.appendChild(option)
  })

  // Set current company to LIC or first company
  currentInsuranceCompany = licCompany || insuranceCompanies[0]
}

async function handleInsuranceCompanyChange(urls) {
  if (!currentInsuranceCompany) return

  const licOfficeTypeContainer = document.getElementById("licOfficeTypeContainer")
  const financeOfficeType = document.getElementById("financeOfficeType")
  const tableSubtitle = document.getElementById("tableSubtitle")

  if (currentInsuranceCompany.has_hierarchy) {
    licOfficeTypeContainer.classList.remove("d-none")
    financeOfficeType.value = "branch"
    tableSubtitle.textContent = "Cases grouped by Branch, Division, Region and Head Office"
  } else {
    licOfficeTypeContainer.classList.add("d-none")
    financeOfficeType.value = ""
    tableSubtitle.textContent = "Cases grouped by office"
  }

  const officeSelect = document.getElementById("financeOffice")
  officeSelect.innerHTML = `<option value="">All Offices</option>`
}

function updateOfficeDropdownFromData() {
  const officeSelect = document.getElementById("financeOffice")
  officeSelect.innerHTML = `<option value="">All Offices</option>`

  if (!allFinanceData || !currentInsuranceCompany) return

  if (currentInsuranceCompany.has_hierarchy) {
    const officeType = document.getElementById("financeOfficeType").value
    if (!officeType || !allFinanceData[officeType]) return

    // Populate dropdown with offices of selected type
    Object.keys(allFinanceData[officeType]).forEach((officeName) => {
      const option = document.createElement("option")
      option.value = officeName
      option.textContent = officeName
      officeSelect.appendChild(option)
    })
  } else {
    // Tata AIG - simple structure
    if (allFinanceData.offices) {
      Object.entries(allFinanceData.offices).forEach(([officeCode, officeInfo]) => {
        const option = document.createElement("option")
        option.value = officeCode
        option.textContent = `${officeInfo.office_name || officeCode} (${officeCode})`
        officeSelect.appendChild(option)
      })
    }
  }
}

function setupFinanceFilters(prefix) {
  const rangeType = document.getElementById(`${prefix}RangeType`)
  const monthInput = document.getElementById(`${prefix}Month`)
  const yearInput = document.getElementById(`${prefix}Year`)
  const customRange = document.getElementById(`${prefix}CustomRange`)

  rangeType.addEventListener("change", () => {
    monthInput.classList.add("d-none")
    yearInput.classList.add("d-none")
    customRange.classList.add("d-none")

    if (rangeType.value === "month") {
      monthInput.classList.remove("d-none")
      yearInput.classList.remove("d-none")
    } else if (rangeType.value === "year") {
      yearInput.classList.remove("d-none")
    } else if (rangeType.value === "custom") {
      customRange.classList.remove("d-none")
    }
  })
}

async function loadFinanceData(apiUrl, csrfToken) {
  if (!currentInsuranceCompany) {
    alert("Please select an insurance company")
    return
  }

  const params = getFinanceFilterParams("finance")
  params.insurance_company_id = currentInsuranceCompany.id

  const url = apiUrl + "?" + toQueryString(params)

  const [success, result] = await callApi("GET", url)
  if (!success || !result.success) {
    alert("Failed to load finance data: " + (result?.error || "Unknown error"))
    return
  }

  allFinanceData = result.data

  updateOfficeDropdownFromData()

  renderFilteredFinanceData()
}

function getFinanceFilterParams(prefix) {
  const rangeType = document.getElementById(`${prefix}RangeType`).value
  const params = {}
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()

  if (rangeType === "month") {
    const monthVal = document.getElementById(`${prefix}Month`).value
    if (monthVal) {
      params.month = new Date(monthVal).getMonth() + 1
      params.year = new Date(monthVal).getFullYear()
    } else {
      params.month = currentMonth
      params.year = currentYear
    }
  } else if (rangeType === "year") {
    const yearVal = document.getElementById(`${prefix}Year`).value
    params.year = yearVal || currentYear
  } else if (rangeType === "custom") {
    params.start_date = document.getElementById(`${prefix}Start`).value
    params.end_date = document.getElementById(`${prefix}End`).value
  } else {
    params.month = currentMonth
    params.year = currentYear
  }

  return params
}

function renderFilteredFinanceData() {
  if (!allFinanceData) return

  const officeType = document.getElementById("financeOfficeType").value
  const officeName = document.getElementById("financeOffice").value

  // Calculate summary based on filters
  const summary = { total_amount: 0, total_cases: 0 }
  let filteredData = {}

  if (currentInsuranceCompany.has_hierarchy) {
    // LIC hierarchy
    if (officeType && officeName) {
      // Specific office selected
      const entry = allFinanceData[officeType]?.[officeName]
      if (entry) {
        summary.total_cases = entry.cases || 0
        summary.total_amount = entry.total_amount || 0
        filteredData[officeType] = { [officeName]: entry }
      }
    } else if (officeType) {
      // Only office type selected - show all offices of that type
      if (allFinanceData[officeType]) {
        filteredData[officeType] = allFinanceData[officeType]
        Object.values(allFinanceData[officeType]).forEach((entry) => {
          summary.total_cases += entry.cases || 0
          summary.total_amount += entry.total_amount || 0
        })
      }
    } else {
      // No filters - show all data
      filteredData = allFinanceData
      ;["branch", "division", "region", "head_office"].forEach((level) => {
        if (allFinanceData[level]) {
          Object.values(allFinanceData[level]).forEach((entry) => {
            summary.total_cases += entry.cases || 0
            summary.total_amount += entry.total_amount || 0
          })
        }
      })
    }
  } else {
    // Tata AIG - simple structure
    if (officeName) {
      // Specific office selected
      const entry = allFinanceData.offices?.[officeName]
      if (entry) {
        summary.total_cases = entry.cases || 0
        summary.total_amount = entry.total_amount || 0
        filteredData = { offices: { [officeName]: entry } }
      }
    } else {
      // No filter - show all offices
      filteredData = allFinanceData
      if (allFinanceData.offices) {
        Object.values(allFinanceData.offices).forEach((entry) => {
          summary.total_cases += entry.cases || 0
          summary.total_amount += entry.total_amount || 0
        })
      }
    }
  }

  renderFinanceSummary(summary)
  renderFinanceTable(filteredData, officeType, officeName)
}

function renderFinanceSummary(summary) {
  const container = document.getElementById("financeSummaryCards")
  container.innerHTML = ""

  const cards = [
    { title: "Total Amount", value: "₹" + (summary.total_amount ?? 0), icon: "fa-money-bill", color: "bg-primary" },
    { title: "Total Cases", value: summary.total_cases ?? 0, icon: "fa-folder", color: "bg-info" },
  ]

  cards.forEach((c) => {
    container.innerHTML += `
            <div class="col-6 col-lg-3 mb-3">
                <div class="stats-card">
                    <div class="stats-card-icon ${c.color} text-white">
                        <i class="fas ${c.icon}"></i>
                    </div>
                    <div class="stats-card-title">${c.title}</div>
                    <div class="h4 fw-bold">${c.value}</div>
                </div>
            </div>`
  })
}

function renderFinanceTable(data, officeType, officeName) {
  const tbody = document.getElementById("financeTableBody")
  tbody.innerHTML = ""

  let hasRecords = false

  if (currentInsuranceCompany.has_hierarchy) {
    const levels = {
      branch: "Branch",
      division: "Division",
      region: "Region",
      head_office: "Head Office",
    }

    for (const [level, entries] of Object.entries(levels)) {
      if (data[level]) {
        hasRecords = true
        for (const [name, info] of Object.entries(data[level])) {
          tbody.innerHTML += `
                        <tr>
                            <td>${entries}</td>
                            <td>${name}</td>
                            <td>${info.cases}</td>
                            <td>₹${info.total_amount}</td>
                        </tr>`
        }
      }
    }
  } else {
    // Simple office structure (Tata AIG, etc.)
    if (data.offices) {
      hasRecords = true
      for (const [code, info] of Object.entries(data.offices)) {
        tbody.innerHTML += `
                    <tr>
                        <td>Office</td>
                        <td>${info.office_name || code} (${code})</td>
                        <td>${info.cases}</td>
                        <td>₹${info.total_amount}</td>
                    </tr>`
      }
    }
  }

  if (!hasRecords) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center">No records found</td></tr>`
  }
}
