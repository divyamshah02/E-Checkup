let csrfToken = "";
let endpoints = {};
let currentReports = {};

async function InitializeReports(token, apiEndpoints) {
    csrfToken = token;
    endpoints = apiEndpoints;

    setupReportFilters();
    await loadReports();
}

function setupReportFilters() {
    document.getElementById("reportRangeType").addEventListener("change", function () {
        document.getElementById("reportMonth").classList.add("d-none");
        document.getElementById("reportYear").classList.add("d-none");
        document.getElementById("customRangeInputs").classList.add("d-none");

        if (this.value === "month") {
            document.getElementById("reportMonth").classList.remove("d-none");
        } else if (this.value === "year") {
            document.getElementById("reportYear").classList.remove("d-none");
        } else if (this.value === "custom") {
            document.getElementById("customRangeInputs").classList.remove("d-none");
        }
    });

    document.getElementById("applyReportFilter").addEventListener("click", loadReports);
}

async function loadReports() {
    let params = {};
    const rangeType = document.getElementById("reportRangeType").value;

    if (rangeType === "month") {
        const monthInput = document.getElementById("reportMonth").value;
        if (monthInput) {
            const [year, month] = monthInput.split("-");
            params.year = year;
            params.month = month;
        }
    } else if (rangeType === "year") {
        const year = document.getElementById("reportYear").value;
        if (year) params.year = year;
    } else if (rangeType === "custom") {
        const start = document.getElementById("reportStart").value;
        const end = document.getElementById("reportEnd").value;
        if (start && end) {
            params.start_date = start;
            params.end_date = end;
        }
    }

    const [success, response] = await callApi("GET", endpoints.reportsApi, params, csrfToken);

    if (success && response.success) {
        currentReports = response.data;
        renderReportSummary(response.data);
        renderReportTable(response.data);
    }
}

function renderReportSummary(data) {
    let container = document.getElementById("reportSummaryCards");
    container.innerHTML = "";

    const levels = ["branch", "division", "region", "head_office"];
    levels.forEach(level => {
        let totalCases = 0;
        for (let key in data[level]) {
            totalCases += data[level][key].cases;
        }

        container.innerHTML += `
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h5>${level.replace("_", " ").toUpperCase()}</h5>
                        <p>${totalCases} cases</p>
                    </div>
                </div>
            </div>
        `;
    });
}

function renderReportTable(data) {
    let tbody = document.getElementById("reportTableBody");
    tbody.innerHTML = "";

    const levels = ["branch", "division", "region", "head_office"];
    levels.forEach(level => {
        for (let key in data[level]) {
            const row = data[level][key];
            tbody.innerHTML += `
                <tr>
                    <td>${level}</td>
                    <td>${row.name || key}</td>
                    <td>${row.cases || 0}</td>
                    <td>${row.completed || "-"}</td>
                    <td>${row.pending || "-"}</td>
                </tr>
            `;
        }
    });
}
