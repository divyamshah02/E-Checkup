async function InitializeFinanceLIC(csrfToken, urls) {
    setupFinanceFilters("finance");

    document.getElementById("financeOfficeType").addEventListener("change", () => {
        populateOfficeOptions();
    });

    document.getElementById("applyFinanceFilter").addEventListener("click", () => {
        loadFinanceLIC(urls.financeApi, csrfToken);
    });

    // Initial load
    await loadFinanceLIC(urls.financeApi, csrfToken);
}

function setupFinanceFilters(prefix) {
    const rangeType = document.getElementById(`${prefix}RangeType`);
    const monthInput = document.getElementById(`${prefix}Month`);
    const yearInput = document.getElementById(`${prefix}Year`);
    const customRange = document.getElementById(`${prefix}CustomRange`);

    rangeType.addEventListener("change", () => {
        monthInput.classList.add("d-none");
        yearInput.classList.add("d-none");
        customRange.classList.add("d-none");

        if (rangeType.value === "month") {
            monthInput.classList.remove("d-none");
            yearInput.classList.remove("d-none");
        } else if (rangeType.value === "year") {
            yearInput.classList.remove("d-none");
        } else if (rangeType.value === "custom") {
            customRange.classList.remove("d-none");
        }
    });
}

function populateOfficeOptions() {
    const type = document.getElementById("financeOfficeType").value;
    const officeSelect = document.getElementById("financeOffice");
    officeSelect.innerHTML = `<option value="">All Offices</option>`;

    // ⚡ TODO: replace with API call later
    const offices = {
        branch: ["93C", "94B", "95A"],
        division: ["DO0979280433", "DO1234567890"],
        region: ["RO001", "RO002"],
        head_office: ["HO001"]
    };

    if (type && offices[type]) {
        offices[type].forEach(o => {
            officeSelect.innerHTML += `<option value="${o}">${o}</option>`;
        });
    }
}

async function loadFinanceLIC(apiUrl, csrfToken) {
    const params = getFinanceFilterParams("finance");
    const url = apiUrl + "?" + toQueryString(params);
    console.log("LIC API URL:", url);

    const [success, result] = await callApi("GET", url);
    if (!success || !result.success) {
        alert("Failed to load LIC Finance data: " + (result?.error || "Unknown error"));
        return;
    }

    const data = result.data;

    // build summary
    const summary = { total_amount: 0, total_cases: 0 };

    const officeType = document.getElementById("financeOfficeType").value;
    const officeName = document.getElementById("financeOffice").value;

    if (officeType && officeName) {
        // filter for selected office only
        const entry = data[officeType]?.[officeName];
        if (entry) {
            summary.total_cases = entry.cases || 0;
            summary.total_amount = entry.total_amount || 0;
        }
    } else {
        // default = all data
        ["branch", "division", "region", "head_office"].forEach(level => {
            if (data[level]) {
                Object.values(data[level]).forEach(entry => {
                    summary.total_cases += entry.cases || 0;
                    summary.total_amount += entry.total_amount || 0;
                });
            }
        });
    }

    renderFinanceLICSummary(summary);
    renderFinanceLICTable(data, officeType, officeName);
}

function getFinanceFilterParams(prefix) {
    const rangeType = document.getElementById(`${prefix}RangeType`).value;
    const officeType = document.getElementById("financeOfficeType").value;
    const officeName = document.getElementById("financeOffice").value;

    const params = {};
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    if (rangeType === "month") {
        const monthVal = document.getElementById(`${prefix}Month`).value;
        if (monthVal) {
            params.month = new Date(monthVal).getMonth() + 1;
            params.year = new Date(monthVal).getFullYear();
        } else {
            params.month = currentMonth;
            params.year = currentYear;
        }
    } else if (rangeType === "year") {
        const yearVal = document.getElementById(`${prefix}Year`).value;
        params.year = yearVal || currentYear;
    } else if (rangeType === "custom") {
        params.start_date = document.getElementById(`${prefix}Start`).value;
        params.end_date = document.getElementById(`${prefix}End`).value;
    } else {
        params.month = currentMonth;
        params.year = currentYear;
    }

    if (officeType) params.office_type = officeType;
    if (officeName) params.office_name = officeName;

    return params;
}

function renderFinanceLICSummary(summary) {
    const container = document.getElementById("financeSummaryCards");
    container.innerHTML = "";

    const cards = [
        { title: "Total Amount", value: "₹" + (summary.total_amount ?? 0), icon: "fa-money-bill", color: "bg-primary" },
        { title: "Total Cases", value: summary.total_cases ?? 0, icon: "fa-folder", color: "bg-info" }
    ];

    cards.forEach(c => {
        container.innerHTML += `
            <div class="col-6 col-lg-3 mb-3">
                <div class="stats-card">
                    <div class="stats-card-icon ${c.color} text-white">
                        <i class="fas ${c.icon}"></i>
                    </div>
                    <div class="stats-card-title">${c.title}</div>
                    <div class="h4 fw-bold">${c.value}</div>
                </div>
            </div>`;
    });
}

function renderFinanceLICTable(data, officeType, officeName) {
    const tbody = document.getElementById("financeTableBody");
    tbody.innerHTML = "";

    const levels = {
        branch: "Branch",
        division: "Division",
        region: "Region",
        head_office: "Head Office"
    };

    let hasRecords = false;

    if (officeType && officeName) {
        const entry = data[officeType]?.[officeName];
        if (entry) {
            hasRecords = true;
            tbody.innerHTML += `
                <tr>
                    <td>${levels[officeType]}</td>
                    <td>${officeName}</td>
                    <td>${entry.cases}</td>
                    <td>₹${entry.total_amount}</td>
                </tr>`;
        }
    } else {
        for (const [level, entries] of Object.entries(levels)) {
            if (data[level]) {
                hasRecords = true;
                for (const [name, info] of Object.entries(data[level])) {
                    tbody.innerHTML += `
                        <tr>
                            <td>${entries}</td>
                            <td>${name}</td>
                            <td>${info.cases}</td>
                            <td>₹${info.total_amount}</td>
                        </tr>`;
                }
            }
        }
    }

    if (!hasRecords) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center">No records found</td></tr>`;
    }
}
