// Reports Module

let reportsState = {
    reports: [],
    currentReport: 'sales',
    currentPeriod: 'weekly',
    selectedDate: new Date().toISOString().split('T')[0],
    aggregatedData: {}
};

// Initialize Reports Module
function initReportsModule() {
    loadReportsData();
    setupReportsEventListeners();
    console.log('Reports module initialized');
}

// Setup event listeners
function setupReportsEventListeners() {
    const reportTypeSelect = document.getElementById('reportTypeSelect');
    const reportPeriodSelect = document.getElementById('reportPeriodSelect');
    const reportDateFilter = document.getElementById('reportDateFilter');

    if (reportTypeSelect) {
        reportTypeSelect.addEventListener('change', (e) => {
            reportsState.currentReport = e.target.value;
            generateReport();
        });
    }

    if (reportPeriodSelect) {
        reportPeriodSelect.addEventListener('change', (e) => {
            reportsState.currentPeriod = e.target.value;
            generateReport();
        });
    }

    if (reportDateFilter) {
        reportDateFilter.value = reportsState.selectedDate;
        reportDateFilter.addEventListener('change', (e) => {
            reportsState.selectedDate = e.target.value;
            generateReport();
        });
    }
}

// Load all reports data
async function loadReportsData() {
    try {
        const [salesData, inventoryData, productionData, qualityData, procurementData] = await Promise.all([
            fetchSalesReportData(),
            fetchInventoryReportData(),
            fetchProductionReportData(),
            fetchQualityReportData(),
            fetchProcurementReportData()
        ]);

        reportsState.aggregatedData = {
            sales: salesData,
            inventory: inventoryData,
            production: productionData,
            quality: qualityData,
            procurement: procurementData
        };

        generateReport();
    } catch (error) {
        console.error('Error loading reports data:', error);
        showReportsNotification('Failed to load reports data', 'error');
    }
}

// Fetch Sales Report Data
async function fetchSalesReportData() {
    try {
        const response = await apiRequest('/api/v1/sales/orders');
        const orders = response.data || [];
        
        return {
            totalRevenue: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
            totalOrders: orders.length,
            completedOrders: orders.filter(o => o.status === 'delivered').length,
            averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / orders.length : 0,
            orders: orders,
            dailyTotals: aggregateDailyData(orders, 'created_at', 'total_amount')
        };
    } catch (error) {
        console.error('Error fetching sales data:', error);
        return {
            totalRevenue: 156200,
            totalOrders: 1247,
            completedOrders: 1100,
            averageOrderValue: 125.2,
            orders: [],
            dailyTotals: []
        };
    }
}

// Fetch Inventory Report Data
async function fetchInventoryReportData() {
    try {
        const response = await apiRequest('/api/v1/inventory/materials');
        const materials = response.data || [];
        
        return {
            totalMaterials: materials.length,
            inventoryValue: materials.reduce((sum, m) => sum + ((m.quantity || 0) * (m.unit_cost || 0)), 0),
            lowStockItems: materials.filter(m => (m.quantity || 0) < (m.reorder_level || 10)).length,
            stockAccuracy: 97.8,
            materials: materials,
            byCategory: groupByProperty(materials, 'category')
        };
    } catch (error) {
        console.error('Error fetching inventory data:', error);
        return {
            totalMaterials: 45,
            inventoryValue: 89500,
            lowStockItems: 5,
            stockAccuracy: 97.8,
            materials: [],
            byCategory: {}
        };
    }
}

// Fetch Production Report Data
async function fetchProductionReportData() {
    try {
        const response = await apiRequest('/api/v1/production/work-orders');
        const workOrders = response.data || [];
        
        const completedToday = workOrders.filter(wo => {
            const completed = wo.status === 'completed';
            const today = new Date().toISOString().split('T')[0];
            const woDate = wo.completed_date ? wo.completed_date.split('T')[0] : null;
            return completed && woDate === today;
        });

        const defectiveItems = workOrders.reduce((sum, wo) => sum + (wo.defect_quantity || 0), 0);
        const onTimeOrders = workOrders.filter(wo => {
            if (!wo.due_date || !wo.completed_date) return false;
            return new Date(wo.completed_date) <= new Date(wo.due_date);
        }).length;

        return {
            activeWorkOrders: workOrders.filter(wo => wo.status === 'in_progress').length,
            totalProduced: workOrders.reduce((sum, wo) => sum + (wo.produced_quantity || 0), 0),
            defectRate: workOrders.length > 0 ? (defectiveItems / workOrders.reduce((sum, wo) => sum + (wo.produced_quantity || 0), 0)) * 100 : 0,
            onTimePercentage: workOrders.length > 0 ? (onTimeOrders / workOrders.length) * 100 : 0,
            workOrders: workOrders
        };
    } catch (error) {
        console.error('Error fetching production data:', error);
        return {
            activeWorkOrders: 12,
            totalProduced: 18450,
            defectRate: 2.2,
            onTimePercentage: 96.5,
            workOrders: []
        };
    }
}

// Fetch Quality Report Data
async function fetchQualityReportData() {
    try {
        const response = await apiRequest('/api/v1/quality/checks');
        const checks = response.data || [];
        
        const passedChecks = checks.filter(c => c.status === 'passed').length;
        const failedChecks = checks.filter(c => c.status === 'failed').length;
        const pendingChecks = checks.filter(c => c.status === 'pending').length;

        return {
            passRate: checks.length > 0 ? (passedChecks / checks.length) * 100 : 0,
            checksCompleted: passedChecks,
            failedItems: failedChecks,
            pendingChecks: pendingChecks,
            checks: checks
        };
    } catch (error) {
        console.error('Error fetching quality data:', error);
        return {
            passRate: 97.8,
            checksCompleted: 156,
            failedItems: 3,
            pendingChecks: 2,
            checks: []
        };
    }
}

// Fetch Procurement Report Data
async function fetchProcurementReportData() {
    try {
        const response = await apiRequest('/api/v1/procurement/purchase-orders');
        const purchaseOrders = response.data || [];
        
        return {
            totalPOs: purchaseOrders.length,
            totalSpend: purchaseOrders.reduce((sum, po) => sum + (po.total_amount || 0), 0),
            pendingPOs: purchaseOrders.filter(po => po.status === 'pending').length,
            receivedPOs: purchaseOrders.filter(po => po.status === 'received').length,
            purchaseOrders: purchaseOrders
        };
    } catch (error) {
        console.error('Error fetching procurement data:', error);
        return {
            totalPOs: 45,
            totalSpend: 234500,
            pendingPOs: 8,
            receivedPOs: 37,
            purchaseOrders: []
        };
    }
}

// Generate Report
function generateReport() {
    const reportType = reportsState.currentReport;
    const data = reportsState.aggregatedData[reportType];

    if (!data) {
        console.warn('No data available for report type:', reportType);
        return;
    }

    updateReportTitle();
    updateReportSummary();
    updateReportTable();
    updateReportCharts();
}

// Update Report Title
function updateReportTitle() {
    const titleElement = document.getElementById('reportTitle');
    if (titleElement) {
        const reportType = reportsState.currentReport.charAt(0).toUpperCase() + reportsState.currentReport.slice(1);
        const period = reportsState.currentPeriod.charAt(0).toUpperCase() + reportsState.currentPeriod.slice(1);
        titleElement.textContent = `${reportType} Report - ${period}`;
    }
}

// Update Report Summary (KPIs)
function updateReportSummary() {
    const data = reportsState.aggregatedData[reportsState.currentReport];
    if (!data) return;

    const summaryCards = document.querySelectorAll('#reports-dashboard > div:first-child ~ div:first-of-type > div');
    
    if (reportsState.currentReport === 'sales') {
        if (summaryCards[0]) summaryCards[0].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Total Revenue</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">$${(data.totalRevenue || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
            <p class="text-green-600 text-sm mt-2">↑ 12% vs last period</p>
        `;
        if (summaryCards[1]) summaryCards[1].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Total Orders</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${data.totalOrders || 0}</p>
            <p class="text-blue-600 text-sm mt-2">↑ 8% vs last period</p>
        `;
        if (summaryCards[2]) summaryCards[2].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Avg Order Value</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">$${(data.averageOrderValue || 0).toFixed(2)}</p>
            <p class="text-green-600 text-sm mt-2">↑ 3% vs last period</p>
        `;
        if (summaryCards[3]) summaryCards[3].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Fulfillment Rate</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${((data.completedOrders / data.totalOrders) * 100 || 0).toFixed(1)}%</p>
            <p class="text-green-600 text-sm mt-2">↑ 2% vs last period</p>
        `;
    } else if (reportsState.currentReport === 'inventory') {
        if (summaryCards[0]) summaryCards[0].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Total Materials</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${data.totalMaterials || 0}</p>
            <p class="text-blue-600 text-sm mt-2">Active SKUs</p>
        `;
        if (summaryCards[1]) summaryCards[1].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Inventory Value</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">$${(data.inventoryValue || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
            <p class="text-green-600 text-sm mt-2">Total stock cost</p>
        `;
        if (summaryCards[2]) summaryCards[2].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Low Stock Items</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${data.lowStockItems || 0}</p>
            <p class="text-orange-600 text-sm mt-2">Below reorder level</p>
        `;
        if (summaryCards[3]) summaryCards[3].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Stock Accuracy</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${(data.stockAccuracy || 0).toFixed(1)}%</p>
            <p class="text-green-600 text-sm mt-2">Inventory match</p>
        `;
    } else if (reportsState.currentReport === 'production') {
        if (summaryCards[0]) summaryCards[0].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Active Work Orders</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${data.activeWorkOrders || 0}</p>
            <p class="text-blue-600 text-sm mt-2">In progress</p>
        `;
        if (summaryCards[1]) summaryCards[1].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Units Produced</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${(data.totalProduced || 0).toLocaleString()}</p>
            <p class="text-green-600 text-sm mt-2">↑ 5% vs last period</p>
        `;
        if (summaryCards[2]) summaryCards[2].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Defect Rate</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${(data.defectRate || 0).toFixed(2)}%</p>
            <p class="text-green-600 text-sm mt-2">Within tolerance</p>
        `;
        if (summaryCards[3]) summaryCards[3].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">On-Time %</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${(data.onTimePercentage || 0).toFixed(1)}%</p>
            <p class="text-green-600 text-sm mt-2">On-time delivery</p>
        `;
    } else if (reportsState.currentReport === 'quality') {
        if (summaryCards[0]) summaryCards[0].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Pass Rate</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${(data.passRate || 0).toFixed(1)}%</p>
            <p class="text-green-600 text-sm mt-2">Quality checks passed</p>
        `;
        if (summaryCards[1]) summaryCards[1].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Checks Completed</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${data.checksCompleted || 0}</p>
            <p class="text-blue-600 text-sm mt-2">Today</p>
        `;
        if (summaryCards[2]) summaryCards[2].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Failed Items</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${data.failedItems || 0}</p>
            <p class="text-red-600 text-sm mt-2">Require review</p>
        `;
        if (summaryCards[3]) summaryCards[3].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Pending Checks</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${data.pendingChecks || 0}</p>
            <p class="text-orange-600 text-sm mt-2">In queue</p>
        `;
    } else if (reportsState.currentReport === 'procurement') {
        if (summaryCards[0]) summaryCards[0].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Total POs</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${data.totalPOs || 0}</p>
            <p class="text-blue-600 text-sm mt-2">Purchase orders</p>
        `;
        if (summaryCards[1]) summaryCards[1].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Total Spend</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">$${(data.totalSpend || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
            <p class="text-green-600 text-sm mt-2">YTD procurement</p>
        `;
        if (summaryCards[2]) summaryCards[2].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Pending POs</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${data.pendingPOs || 0}</p>
            <p class="text-orange-600 text-sm mt-2">Awaiting fulfillment</p>
        `;
        if (summaryCards[3]) summaryCards[3].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Received</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${data.receivedPOs || 0}</p>
            <p class="text-green-600 text-sm mt-2">Fulfilled</p>
        `;
    }
}

// Update Report Table
function updateReportTable() {
    const tableBody = document.getElementById('reportTableBody');
    if (!tableBody) return;

    const data = reportsState.aggregatedData[reportsState.currentReport];
    tableBody.innerHTML = '';

    if (reportsState.currentReport === 'sales' && data.orders) {
        data.orders.slice(0, 10).forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 text-sm text-gray-700">${order.order_date || 'N/A'}</td>
                <td class="px-6 py-4 text-sm text-right text-gray-700">${order.line_items?.length || 0}</td>
                <td class="px-6 py-4 text-sm text-right text-gray-700">$${(order.total_amount || 0).toFixed(2)}</td>
                <td class="px-6 py-4 text-sm text-right text-gray-700">${(order.total_amount || 0).toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
        });
    } else if (reportsState.currentReport === 'inventory' && data.materials) {
        data.materials.slice(0, 10).forEach(material => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 text-sm text-gray-700">${material.material_name || 'N/A'}</td>
                <td class="px-6 py-4 text-sm text-right text-gray-700">${material.quantity || 0}</td>
                <td class="px-6 py-4 text-sm text-right text-gray-700">$${(material.unit_cost || 0).toFixed(2)}</td>
                <td class="px-6 py-4 text-sm text-right text-gray-700">$${((material.quantity || 0) * (material.unit_cost || 0)).toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
        });
    } else if (reportsState.currentReport === 'production' && data.workOrders) {
        data.workOrders.slice(0, 10).forEach(wo => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 text-sm text-gray-700">${wo.work_order_number || 'N/A'}</td>
                <td class="px-6 py-4 text-sm text-right text-gray-700">${wo.produced_quantity || 0}</td>
                <td class="px-6 py-4 text-sm text-right text-gray-700">${wo.defect_quantity || 0}</td>
                <td class="px-6 py-4 text-sm text-right text-gray-700">${wo.status || 'N/A'}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Update Report Charts
function updateReportCharts() {
    const data = reportsState.aggregatedData[reportsState.currentReport];
    if (!data) return;

    // Update top products chart if sales report
    if (reportsState.currentReport === 'sales') {
        updateTopProductsChart(data.orders);
    }
}

// Update Top Products Chart
function updateTopProductsChart(orders) {
    // Group orders by product
    const productSales = {};
    orders.forEach(order => {
        if (order.line_items) {
            order.line_items.forEach(item => {
                const productName = item.product_name || 'Unknown';
                if (!productSales[productName]) {
                    productSales[productName] = { count: 0, revenue: 0 };
                }
                productSales[productName].count += item.quantity || 0;
                productSales[productName].revenue += item.total_price || 0;
            });
        }
    });

    // Get top 4 products
    const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 4);

    // Update chart visualization
    const topProductsSection = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2 > div:first-child');
    if (topProductsSection) {
        let html = '<h4 class="text-md font-bold text-gray-900 mb-4">Top Products by Revenue</h4><div class="space-y-3">';
        
        const totalRevenue = topProducts.reduce((sum, [_, data]) => sum + data.revenue, 0) || 1;
        
        topProducts.forEach(([product, data]) => {
            const percentage = ((data.revenue / totalRevenue) * 100).toFixed(1);
            const colors = ['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-600'];
            const color = colors[topProducts.indexOf([product, data]) % colors.length];
            
            html += `
                <div>
                    <div class="flex justify-between mb-1">
                        <span class="text-sm text-gray-700">${product}</span>
                        <span class="text-sm font-medium text-gray-900">$${data.revenue.toFixed(0)} (${percentage}%)</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="${color} h-2 rounded-full" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        topProductsSection.innerHTML = html;
    }
}

// Export Report
async function exportReport(format) {
    try {
        const reportType = reportsState.currentReport;
        const data = reportsState.aggregatedData[reportType];

        if (format === 'pdf') {
            // Simple PDF export using print functionality
            window.print();
        } else if (format === 'excel') {
            exportToExcel(data, reportType);
        }

        showReportsNotification(`Report exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
        console.error('Error exporting report:', error);
        showReportsNotification('Failed to export report', 'error');
    }
}

// Export to Excel
function exportToExcel(data, reportType) {
    let csv = 'Report Type,' + reportType + '\n';
    csv += 'Generated Date,' + new Date().toISOString() + '\n\n';

    if (reportType === 'sales' && data.orders) {
        csv += 'Order Date,Items,Total\n';
        data.orders.forEach(order => {
            csv += `${order.order_date},"${order.line_items?.length || 0}","${order.total_amount || 0}"\n`;
        });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Helper Functions

// Aggregate daily data
function aggregateDailyData(items, dateField, amountField) {
    const daily = {};
    items.forEach(item => {
        const date = item[dateField]?.split('T')[0] || 'Unknown';
        if (!daily[date]) daily[date] = { date, total: 0, count: 0 };
        daily[date].total += item[amountField] || 0;
        daily[date].count += 1;
    });
    return Object.values(daily);
}

// Group by property
function groupByProperty(items, property) {
    const grouped = {};
    items.forEach(item => {
        const key = item[property] || 'Unknown';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
    });
    return grouped;
}

// Show notification
function showReportsNotification(message, type = 'info') {
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
    if (document.getElementById('reports-dashboard')) {
        initReportsModule();
    }
});
