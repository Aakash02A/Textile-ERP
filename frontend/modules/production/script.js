// Production Module

const PRODUCTION_API = {
    BASE: '/api/v1/production',
    WORK_ORDERS: '/api/v1/production/work-orders',
    PRODUCTION_LOGS: '/api/v1/production/logs',
    EMPLOYEES: '/api/v1/production/employees'
};

const productionState = {
    workOrders: [],
    productionLogs: [],
    employees: [],
    filters: { status: 'all', dateRange: 'week' }
};

/**
 * Initialize Production Module
 */
function initProductionModule() {
    console.log('Initializing Production Module...');
    
    loadProductionData();
    
    const createWorkOrderForm = document.getElementById('createWorkOrderForm');
    if (createWorkOrderForm) {
        createWorkOrderForm.addEventListener('submit', handleCreateWorkOrder);
    }
}

/**
 * Load all production data
 */
async function loadProductionData() {
    try {
        console.log('Loading production data...');
        
        const [workOrders, logs, employees] = await Promise.all([
            fetchWorkOrders(),
            fetchProductionLogs(),
            fetchEmployees()
        ]);
        
        productionState.workOrders = workOrders;
        productionState.productionLogs = logs;
        productionState.employees = employees;
        
        updateProductionDashboard();
        updateWorkOrdersTable();
        updateProductionLogsTable();
    } catch (error) {
        console.error('Error loading production data:', error);
        showNotification('Failed to load production data', 'error');
    }
}

/**
 * Fetch work orders
 */
async function fetchWorkOrders() {
    try {
        const response = await apiRequest(PRODUCTION_API.WORK_ORDERS, {
            method: 'GET'
        });
        
        if (!response.ok) throw new Error('Failed to fetch work orders');
        
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching work orders:', error);
        return [];
    }
}

/**
 * Fetch production logs
 */
async function fetchProductionLogs() {
    try {
        const response = await apiRequest(PRODUCTION_API.PRODUCTION_LOGS, {
            method: 'GET'
        });
        
        if (!response.ok) throw new Error('Failed to fetch production logs');
        
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching production logs:', error);
        return [];
    }
}

/**
 * Fetch employees
 */
async function fetchEmployees() {
    try {
        const response = await apiRequest(PRODUCTION_API.EMPLOYEES, {
            method: 'GET'
        });
        
        if (!response.ok) throw new Error('Failed to fetch employees');
        
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching employees:', error);
        return [];
    }
}

/**
 * Update production dashboard
 */
function updateProductionDashboard() {
    // Calculate KPIs
    const activeOrders = productionState.workOrders.filter(wo => 
        wo.status === 'In Progress' || wo.status === 'Pending'
    ).length;
    
    // Today's output
    const today = new Date().toISOString().split('T')[0];
    const todaysLogs = productionState.productionLogs.filter(log => 
        log.log_date.startsWith(today)
    );
    
    const todaysOutput = todaysLogs.reduce((sum, log) => 
        sum + (log.quantity_produced || 0), 0
    );
    
    // Defect rate
    const totalProduced = productionState.productionLogs.reduce((sum, log) => 
        sum + (log.quantity_produced || 0), 0
    );
    
    const totalDefective = productionState.productionLogs.reduce((sum, log) => 
        sum + (log.quantity_defective || 0), 0
    );
    
    const defectRate = totalProduced > 0 
        ? ((totalDefective / totalProduced) * 100).toFixed(1) 
        : 0;
    
    // Update DOM
    const activeEl = document.getElementById('activeWorkOrders');
    const outputEl = document.getElementById('todaysOutput');
    const defectEl = document.getElementById('defectRate');
    
    if (activeEl) activeEl.textContent = activeOrders;
    if (outputEl) outputEl.textContent = todaysOutput;
    if (defectEl) defectEl.textContent = defectRate + '%';
}

/**
 * Update work orders table
 */
function updateWorkOrdersTable() {
    const tableBody = document.getElementById('workOrdersTable');
    if (!tableBody) return;
    
    if (productionState.workOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    No work orders found. <a href="#" onclick="loadOperation('create-work-order')" class="text-blue-600 hover:underline">Create one now</a>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = productionState.workOrders.map(wo => {
        const statusClasses = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'In Progress': 'bg-blue-100 text-blue-800',
            'Completed': 'bg-green-100 text-green-800',
            'On Hold': 'bg-orange-100 text-orange-800'
        };
        
        const statusClass = statusClasses[wo.status] || 'bg-gray-100 text-gray-800';
        
        return `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">${wo.wo_number || '-'}</td>
                <td class="px-6 py-4 text-sm text-gray-700">${wo.product_name || '-'}</td>
                <td class="px-6 py-4 text-sm text-right text-gray-700">${wo.quantity || 0}</td>
                <td class="px-6 py-4 text-sm">
                    <span class="${statusClass} px-3 py-1 rounded-full text-xs font-medium">
                        ${wo.status || '-'}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">${wo.assigned_to || '-'}</td>
                <td class="px-6 py-4 text-sm text-gray-700">${wo.planned_end_date || '-'}</td>
                <td class="px-6 py-4 text-center">
                    <button onclick="viewWorkOrder('${wo.id}')" class="text-blue-600 hover:text-blue-800 text-sm font-medium mr-2">View</button>
                    <button onclick="updateWorkOrderStatus('${wo.id}')" class="text-green-600 hover:text-green-800 text-sm font-medium">Update</button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Update production logs table
 */
function updateProductionLogsTable() {
    const tableBody = document.getElementById('productionLogsTable');
    if (!tableBody) return;
    
    if (productionState.productionLogs.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    No production logs found. <a href="#" onclick="loadOperation('add-production-log')" class="text-blue-600 hover:underline">Add one now</a>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = productionState.productionLogs.slice(0, 10).map(log => {
        return `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">${log.work_order_id || '-'}</td>
                <td class="px-6 py-4 text-sm text-right text-gray-700">${log.quantity_produced || 0}</td>
                <td class="px-6 py-4 text-sm text-right text-gray-700">${log.quantity_defective || 0}</td>
                <td class="px-6 py-4 text-sm text-gray-700">${log.log_date || '-'}</td>
                <td class="px-6 py-4 text-sm text-gray-700">${log.logged_by || '-'}</td>
                <td class="px-6 py-4 text-center">
                    <button onclick="viewLog('${log.id}')" class="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Handle create work order form submission
 */
async function handleCreateWorkOrder(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        product_id: form.querySelector('select').value,
        quantity: parseInt(form.querySelectorAll('input')[0].value),
        assigned_to: form.querySelectorAll('select')[1].value,
        planned_end_date: form.querySelectorAll('input')[1].value,
        notes: form.querySelector('textarea').value,
        status: 'Pending'
    };
    
    try {
        const response = await apiRequest(PRODUCTION_API.WORK_ORDERS, {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to create work order');
        
        showNotification('Work Order created successfully!', 'success');
        form.reset();
        
        await loadProductionData();
        setTimeout(() => {
            loadOperation('production-dashboard');
        }, 1500);
    } catch (error) {
        console.error('Error creating work order:', error);
        showNotification('Failed to create work order', 'error');
    }
}

/**
 * View work order details
 */
async function viewWorkOrder(woId) {
    try {
        const response = await apiRequest(`${PRODUCTION_API.WORK_ORDERS}/${woId}`, {
            method: 'GET'
        });
        
        if (!response.ok) throw new Error('Failed to fetch work order');
        
        const workOrder = await response.json();
        console.log('Work Order details:', workOrder);
        showNotification(`Viewing: ${workOrder.wo_number}`, 'info');
    } catch (error) {
        console.error('Error viewing work order:', error);
        showNotification('Failed to load work order details', 'error');
    }
}

/**
 * Update work order status
 */
async function updateWorkOrderStatus(woId) {
    const workOrder = productionState.workOrders.find(wo => wo.id === woId);
    if (!workOrder) {
        showNotification('Work Order not found', 'error');
        return;
    }
    
    // Status progression
    const statusProgression = {
        'Pending': 'In Progress',
        'In Progress': 'Completed',
        'Completed': 'Completed',
        'On Hold': 'Pending'
    };
    
    const newStatus = statusProgression[workOrder.status] || 'Pending';
    
    try {
        const response = await apiRequest(`${PRODUCTION_API.WORK_ORDERS}/${woId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) throw new Error('Failed to update work order');
        
        showNotification(`Work Order updated to: ${newStatus}`, 'success');
        await loadProductionData();
    } catch (error) {
        console.error('Error updating work order:', error);
        showNotification('Failed to update work order', 'error');
    }
}

/**
 * View production log
 */
async function viewLog(logId) {
    try {
        const response = await apiRequest(`${PRODUCTION_API.PRODUCTION_LOGS}/${logId}`, {
            method: 'GET'
        });
        
        if (!response.ok) throw new Error('Failed to fetch log');
        
        const log = await response.json();
        console.log('Production log:', log);
        showNotification('Production log loaded', 'info');
    } catch (error) {
        console.error('Error viewing log:', error);
        showNotification('Failed to load production log', 'error');
    }
}

/**
 * Filter work orders by status
 */
function filterWorkOrdersByStatus(status) {
    productionState.filters.status = status;
    updateWorkOrdersTable();
}

/**
 * Filter logs by date range
 */
function filterLogsByDateRange(dateRange) {
    productionState.filters.dateRange = dateRange;
    updateProductionLogsTable();
}

/**
 * Export production report to CSV
 */
function exportProductionReport() {
    const headers = ['WO Number', 'Product', 'Quantity', 'Status', 'Assigned To', 'Due Date'];
    const data = productionState.workOrders.map(wo => [
        wo.wo_number || '',
        wo.product_name || '',
        wo.quantity || 0,
        wo.status || '',
        wo.assigned_to || '',
        wo.planned_end_date || ''
    ]);
    
    exportToCSV(data, headers, 'production-work-orders.csv');
}

/**
 * Print production dashboard
 */
function printProductionDashboard() {
    printElement('production-dashboard');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initProductionModule();
});
