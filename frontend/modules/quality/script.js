// Quality Module

let qualityState = {
    checks: [],
    reports: [],
    currentFilter: 'all'
};

// Initialize Quality Module
function initQualityModule() {
    loadQualityData();
    setupQualityEventListeners();
    console.log('Quality module initialized');
}

// Setup event listeners
function setupQualityEventListeners() {
    const qcForm = document.getElementById('qcForm');
    if (qcForm) {
        qcForm.addEventListener('submit', handleSubmitQCForm);
    }
}

// Load quality data
async function loadQualityData() {
    try {
        const [checksData, reportsData] = await Promise.all([
            fetchQCChecks(),
            fetchQualityReports()
        ]);

        qualityState.checks = checksData;
        qualityState.reports = reportsData;

        updateQualityDashboard();
        updateQCChecksTable();
    } catch (error) {
        console.error('Error loading quality data:', error);
        showQualityNotification('Failed to load quality data', 'error');
    }
}

// Fetch QC Checks
async function fetchQCChecks() {
    try {
        const response = await apiRequest('/api/v1/quality/checks');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching QC checks:', error);
        // Return sample data
        return [
            {
                check_id: 'qc001',
                material_name: 'Cotton Fabric',
                quantity_checked: 100,
                status: 'passed',
                check_date: new Date().toISOString(),
                check_type: 'dimensional',
                defects: 0
            },
            {
                check_id: 'qc002',
                material_name: 'Silk Blend',
                quantity_checked: 50,
                status: 'pending',
                check_date: new Date().toISOString(),
                check_type: 'visual',
                defects: null
            }
        ];
    }
}

// Fetch Quality Reports
async function fetchQualityReports() {
    try {
        const response = await apiRequest('/api/v1/quality/reports');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching quality reports:', error);
        return [];
    }
}

// Update Quality Dashboard
function updateQualityDashboard() {
    const passedChecks = qualityState.checks.filter(c => c.status === 'passed').length;
    const failedChecks = qualityState.checks.filter(c => c.status === 'failed').length;
    const pendingChecks = qualityState.checks.filter(c => c.status === 'pending').length;
    const totalDefects = qualityState.checks.reduce((sum, c) => sum + (c.defects || 0), 0);

    // Calculate pass rate
    const passRate = qualityState.checks.length > 0 ? (passedChecks / qualityState.checks.length) * 100 : 0;

    // Update KPI cards
    const kpiCards = document.querySelectorAll('.grid > div');
    if (kpiCards[0]) {
        kpiCards[0].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Pass Rate</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${passRate.toFixed(1)}%</p>
            <p class="text-green-600 text-sm mt-2">↑ 2.3% vs last week</p>
        `;
    }

    if (kpiCards[1]) {
        kpiCards[1].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Checks Completed Today</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${passedChecks}</p>
            <p class="text-blue-600 text-sm mt-2">Passed checks</p>
        `;
    }

    if (kpiCards[2]) {
        kpiCards[2].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Failed Items</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${failedChecks}</p>
            <p class="text-red-600 text-sm mt-2">Require rework</p>
        `;
    }

    if (kpiCards[3]) {
        kpiCards[3].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Pending Checks</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${pendingChecks}</p>
            <p class="text-orange-600 text-sm mt-2">In queue</p>
        `;
    }
}

// Update QC Checks Table
function updateQCChecksTable() {
    const tableBody = document.getElementById('qcChecksTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    qualityState.checks.forEach(check => {
        const row = document.createElement('tr');
        const statusClass = `quality-badge ${check.status}`;
        const checkIcon = check.status === 'passed' ? '✓' : check.status === 'failed' ? '✗' : '−';

        row.innerHTML = `
            <td class="px-6 py-4 text-sm text-gray-700">${check.check_date?.split('T')[0] || 'N/A'}</td>
            <td class="px-6 py-4 text-sm text-gray-700">${check.material_name || 'N/A'}</td>
            <td class="px-6 py-4 text-sm text-gray-700">${check.check_type || 'N/A'}</td>
            <td class="px-6 py-4 text-sm text-right text-gray-700">${check.quantity_checked || 0}</td>
            <td class="px-6 py-4 text-sm text-right text-gray-700">${check.defects || 0}</td>
            <td class="px-6 py-4 text-sm">
                <span class="${statusClass}">${check.status.toUpperCase()}</span>
            </td>
            <td class="px-6 py-4 text-sm">
                <button onclick="viewQCCheck('${check.check_id}')" class="text-indigo-600 hover:text-indigo-900 font-medium">View</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Handle Submit QC Form
async function handleSubmitQCForm(e) {
    e.preventDefault();

    const formData = {
        material_id: document.getElementById('qcMaterial')?.value,
        check_type: document.getElementById('qcCheckType')?.value,
        quantity_checked: parseInt(document.getElementById('qcQuantity')?.value) || 0,
        defects: parseInt(document.getElementById('qcDefects')?.value) || 0,
        parameters: Array.from(document.querySelectorAll('.parameter-checkbox:checked')).map(cb => cb.value),
        notes: document.getElementById('qcNotes')?.value || ''
    };

    // Validate required fields
    if (!formData.material_id || !formData.check_type || formData.quantity_checked === 0) {
        showQualityNotification('Please fill in all required fields', 'error');
        return;
    }

    // Determine status
    const status = formData.defects === 0 ? 'passed' : 'failed';

    try {
        const response = await apiRequest('/api/v1/quality/checks', {
            method: 'POST',
            body: JSON.stringify({
                ...formData,
                status: status,
                check_date: new Date().toISOString()
            })
        });

        showQualityNotification('QC Check recorded successfully', 'success');
        document.getElementById('qcForm').reset();

        // Reload data
        await loadQualityData();
    } catch (error) {
        console.error('Error submitting QC form:', error);
        showQualityNotification('Failed to record QC check', 'error');
    }
}

// View QC Check
function viewQCCheck(checkId) {
    const check = qualityState.checks.find(c => c.check_id === checkId);
    if (!check) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-md w-full p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">QC Check Details</h3>
            <div class="space-y-3 mb-6">
                <div>
                    <p class="text-sm text-gray-600">Material</p>
                    <p class="text-gray-900 font-medium">${check.material_name || 'N/A'}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Check Type</p>
                    <p class="text-gray-900 font-medium">${check.check_type || 'N/A'}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Quantity Checked</p>
                    <p class="text-gray-900 font-medium">${check.quantity_checked || 0}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Defects Found</p>
                    <p class="text-gray-900 font-medium">${check.defects || 0}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Status</p>
                    <span class="quality-badge ${check.status}">${check.status.toUpperCase()}</span>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Check Date</p>
                    <p class="text-gray-900 font-medium">${check.check_date?.split('T')[0] || 'N/A'}</p>
                </div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

// Filter Checks by Status
function filterChecksByStatus(status) {
    qualityState.currentFilter = status;

    const filtered = status === 'all' 
        ? qualityState.checks 
        : qualityState.checks.filter(c => c.status === status);

    const tableBody = document.getElementById('qcChecksTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    filtered.forEach(check => {
        const row = document.createElement('tr');
        const statusClass = `quality-badge ${check.status}`;

        row.innerHTML = `
            <td class="px-6 py-4 text-sm text-gray-700">${check.check_date?.split('T')[0] || 'N/A'}</td>
            <td class="px-6 py-4 text-sm text-gray-700">${check.material_name || 'N/A'}</td>
            <td class="px-6 py-4 text-sm text-gray-700">${check.check_type || 'N/A'}</td>
            <td class="px-6 py-4 text-sm text-right text-gray-700">${check.quantity_checked || 0}</td>
            <td class="px-6 py-4 text-sm text-right text-gray-700">${check.defects || 0}</td>
            <td class="px-6 py-4 text-sm">
                <span class="${statusClass}">${check.status.toUpperCase()}</span>
            </td>
            <td class="px-6 py-4 text-sm">
                <button onclick="viewQCCheck('${check.check_id}')" class="text-indigo-600 hover:text-indigo-900 font-medium">View</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Export Quality Report
function exportQualityReport(format) {
    try {
        if (format === 'pdf') {
            window.print();
        } else if (format === 'excel') {
            let csv = 'QC Check Report\n';
            csv += `Generated: ${new Date().toISOString()}\n\n`;
            csv += 'Date,Material,Check Type,Quantity,Defects,Status\n';

            qualityState.checks.forEach(check => {
                csv += `${check.check_date?.split('T')[0]},${check.material_name},${check.check_type},${check.quantity_checked},${check.defects},${check.status}\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `quality_report_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        }

        showQualityNotification(`Report exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
        console.error('Error exporting report:', error);
        showQualityNotification('Failed to export report', 'error');
    }
}

// Show notification
function showQualityNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-3 rounded-lg text-white text-sm font-medium shadow-lg ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('qcForm')) {
        initQualityModule();
    }
});
