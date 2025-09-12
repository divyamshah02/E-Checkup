async function InitializeFinanceDC(csrfToken, urls) {
    setupFinanceFilters("dc");

    document.getElementById("applyDCFilter").addEventListener("click", () => {
        loadFinanceDC(urls.financeApi, csrfToken);
    });

    // Initial load
    await loadFinanceDC(urls.financeApi, csrfToken);
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
        } else if (rangeType.value === "year") {
            yearInput.classList.remove("d-none");
        } else if (rangeType.value === "custom") {
            customRange.classList.remove("d-none");
        }
    });
}

async function loadFinanceDC(apiUrl, csrfToken) {
    const params = getFinanceFilterParams("dc");
    const url = apiUrl + toQueryString(params);
    const response = await callApi("GET", url);
    if (!response.success) {
        alert("Failed to load DC Finance data: " + (response.error || "Unknown error"));
        return;
    }

    renderFinanceDCSummary(response.data.summary);
    renderFinanceDCTable(response.data.records);
}

function getFinanceFilterParams(prefix) {
    const rangeType = document.getElementById(`${prefix}RangeType`).value;
    const params = { range_type: rangeType };

    if (rangeType === "month") {
        params.month = document.getElementById(`${prefix}Month`).value;
    } else if (rangeType === "year") {
        params.year = document.getElementById(`${prefix}Year`).value;
    } else if (rangeType === "custom") {
        params.start_date = document.getElementById(`${prefix}Start`).value;
        params.end_date = document.getElementById(`${prefix}End`).value;
    }
    return params;
}

function renderFinanceDCSummary(summary) {
    const container = document.getElementById("dcSummaryCards");
    container.innerHTML = "";

    const cards = [
        { title: "Total Payout", value: summary.total_payout, icon: "fa-hand-holding-usd", color: "bg-primary" },
        { title: "Total Cases", value: summary.total_cases, icon: "fa-folder", color: "bg-info" },
        { title: "Total DCs", value: summary.total_dcs, icon: "fa-hospital", color: "bg-success" },
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

function renderFinanceDCTable(records) {
    const tbody = document.getElementById("dcTableBody");
    tbody.innerHTML = "";

    records.forEach(r => {
        tbody.innerHTML += `
            <tr>
                <td>${r.dc_name}</td>
                <td>${r.cases}</td>
                <td>₹${r.total_amount}</td>
            </tr>`;
    });
}
