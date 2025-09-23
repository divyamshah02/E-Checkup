// finance-dc.js (REPLACE existing file)

async function InitializeFinanceDC(csrfToken, urls) {
    setupFinanceFilters("dc");

    // apply button
    document.getElementById("applyDCFilter").addEventListener("click", () => {
        loadFinanceDC(urls.financeApi, csrfToken);
    });

    // initial load
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
            yearInput.classList.remove("d-none");
        } else if (rangeType.value === "year") {
            yearInput.classList.remove("d-none");
        } else if (rangeType.value === "custom") {
            customRange.classList.remove("d-none");
        }
    });
}

/**
 * Main loader - calls API with correct params and renders UI
 */
async function loadFinanceDC(apiUrl, csrfToken) {
    const params = getFinanceFilterParams("dc");
    const url = apiUrl + "?" + toQueryString(params);
    console.log("DC API URL:", url);

    const [success, result] = await callApi("GET", url);
    if (!success || !result || !result.success) {
        alert("Failed to load DC Finance data: " + ((result && result.error) || "Unknown error"));
        return;
    }

    const raw = result.data;

    // Normalize backend output into an array of objects:
    // - Accepts either: array of {dc_name, cases, total_amount}
    // - Or dict: { DC_ID: { dc_name:..., cases:..., total_amount:... }, ... }
    const list = normalizeDCData(raw);

    // populate DC dropdown from result (keeps current selection if any)
    populateDCSelect(list);

    // selectedDC value from dropdown (string). If empty → all DCs
    const selectedDC = document.getElementById("dcSelect").value;

    // Build summary
    let summary = { total_payout: 0, total_cases: 0, total_dcs: 0 };

    if (selectedDC) {
        const entry = list.find(dc => dc.dc_name === selectedDC || dc.dc_id === selectedDC);
        if (entry) {
            summary.total_cases = entry.cases || 0;
            summary.total_payout = entry.total_amount || 0;
            summary.total_dcs = 1;
        }
    } else {
        list.forEach(dc => {
            summary.total_cases += dc.cases || 0;
            summary.total_payout += dc.total_amount || 0;
        });
        summary.total_dcs = list.length;
    }

    renderFinanceDCSummary(summary);
    renderFinanceDCTable(list, selectedDC);
}

/**
 * Build query params expected by Django views.
 * No 'range_type' param is included — only month/year or start_date/end_date or year or fy.
 */
function getFinanceFilterParams(prefix) {
    const rangeType = document.getElementById(`${prefix}RangeType`).value;
    const params = {};
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    if (rangeType === "month") {
        // If user selected a month input (YYYY-MM) convert to numeric month and year
        const monthVal = document.getElementById(`${prefix}Month`).value;
        if (monthVal) {
            const dt = new Date(monthVal + "-01");
            params.month = dt.getMonth() + 1;
            params.year = dt.getFullYear();
        } else {
            // default to current
            params.month = currentMonth;
            params.year = currentYear;
        }
    } else if (rangeType === "year") {
        const yearVal = document.getElementById(`${prefix}Year`).value;
        params.year = yearVal || currentYear;
    } else if (rangeType === "custom") {
        const start = document.getElementById(`${prefix}Start`).value;
        const end = document.getElementById(`${prefix}End`).value;
        if (start) params.start_date = start;
        if (end) params.end_date = end;
    } else {
        // default when nothing explicit chosen -> current month/year
        params.month = currentMonth;
        params.year = currentYear;
    }

    // if user filtered by DC name, include it (backend can optionally use this to filter)
    const selectedDC = document.getElementById("dcSelect")?.value;
    if (selectedDC) params.dc_name = selectedDC;

    return params;
}

/**
 * Render summary cards for DC Finance
 */
function renderFinanceDCSummary(summary) {
    const container = document.getElementById("dcSummaryCards");
    container.innerHTML = "";

    const cards = [
        { title: "Total Payout", value: "₹" + (summary.total_payout ?? 0), icon: "fa-hand-holding-usd", color: "bg-primary" },
        { title: "Total Cases", value: summary.total_cases ?? 0, icon: "fa-folder", color: "bg-info" },
        { title: "Total DCs", value: summary.total_dcs ?? 0, icon: "fa-hospital", color: "bg-success" },
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

/**
 * Render table of DC payouts. If selectedDC provided, shows only that row.
 */
function renderFinanceDCTable(records, selectedDC) {
    const tbody = document.getElementById("dcTableBody");
    tbody.innerHTML = "";

    let filtered = records;
    if (selectedDC) {
        filtered = records.filter(r => r.dc_name === selectedDC || r.dc_id === selectedDC);
    }

    if (!filtered || filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center">No records found</td></tr>`;
        return;
    }

    filtered.forEach(r => {
        tbody.innerHTML += `
            <tr>
                <td>${escapeHtml(r.dc_name ?? r.dc_id ?? "Unknown")}</td>
                <td>${r.cases ?? 0}</td>
                <td>₹${r.total_amount ?? 0}</td>
            </tr>`;
    });
}

/**
 * Populate dcSelect from API results. Keeps current selection if present.
 */
function populateDCSelect(list) {
    const select = document.getElementById("dcSelect");
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = `<option value="">All DCs</option>`;

    list.forEach(dc => {
        // use dc_name as value to match existing UX; also include dc_id in data if needed
        const name = dc.dc_name ?? dc.dc_id ?? "Unknown";
        select.innerHTML += `<option value="${escapeAttr(name)}">${escapeHtml(name)}</option>`;
    });

    // restore selection if still available
    if (currentVal) select.value = currentVal;
}

/**
 * Normalize backend data into array of { dc_id, dc_name, cases, total_amount }
 * Accepts both dicts and arrays.
 */
function normalizeDCData(raw) {
    if (!raw) return [];

    // If backend already returns an array
    if (Array.isArray(raw)) {
        // ensure objects contain dc_name, cases, total_amount
        return raw.map(item => ({
            dc_id: item.dc_id ?? item.id ?? null,
            dc_name: item.dc_name ?? item.name ?? item.dc ?? null,
            cases: Number(item.cases ?? 0),
            total_amount: Number(item.total_amount ?? item.total_payout ?? 0),
        }));
    }

    // If backend returns a dict/object: { dc_id: {dc_name, cases, total_amount}, ... }
    if (typeof raw === "object") {
        return Object.entries(raw).map(([key, val]) => ({
            dc_id: key,
            dc_name: val.dc_name ?? val.name ?? key,
            cases: Number(val.cases ?? 0),
            total_amount: Number(val.total_amount ?? val.total_payout ?? 0),
        }));
    }

    return [];
}

/** small helpers to avoid HTML injection when inserting values */
function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function escapeAttr(s){ return escapeHtml(s); }
