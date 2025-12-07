/**
 * Textile ERP - Procurement Module
 * Handles purchase orders, suppliers, and procurement operations
 */

// Procurement Module API Endpoints
const PROCUREMENT_API = {
    BASE: '/api/v1/procurement',
    POS: '/api/v1/procurement/purchase-orders',
    SUPPLIERS: '/api/v1/procurement/suppliers',
    PO_ITEMS: '/api/v1/procurement/po-items'
};

// State Management
const procurementState = {
    pos: [],
    suppliers: [],
    currentPO: null,
    filters: {
        status: 'all',
        dateRange: 'month'
    }
};

/**
 * Initialize Procurement Module
 */
function initProcurementModule() {
    console.log('Initializing Procurement Module');
    
    // Add event listeners
    const poForm = document.getElementById('poForm');
    if (poForm) {
        poForm.addEventListener('submit', handleCreatePO);
    }
    
    // Setup item calculations
    setupPOItemCalculations();
    
    // Load initial data
    loadProcurementData();
}

/**
 * Load all procurement data
 */
async function loadProcurementData() {
    try {
        // Load POs and Suppliers in parallel
        const [pos, suppliers] = await Promise.all([
            fetchPurchaseOrders(),
            fetchSuppliers()
        ]);
        
        procurementState.pos = pos;
        procurementState.suppliers = suppliers;
        
        updateProcurementDashboard();
    } catch (error) {
        console.error('Error loading procurement data:', error);
        showNotification('Failed to load procurement data', 'error');
    }
}

/**
 * Fetch purchase orders from API
 */
async function fetchPurchaseOrders() {
    try {
        const response = await apiRequest(PROCUREMENT_API.POS);
        return response.data || [];
    } catch (error) {
        console.error('Error fetching POs:', error);
        return [];
    }
}

/**
 * Fetch suppliers from API
 */
async function fetchSuppliers() {
    try {
        const response = await apiRequest(PROCUREMENT_API.SUPPLIERS);
        return response.data || [];
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        return [];
    }
}

/**
 * Update Procurement Dashboard with data
 */
function updateProcurementDashboard() {
    // Calculate statistics
    const stats = calculateProcurementStats();
    
    // Update KPI cards
    document.getElementById('totalPos').textContent = stats.totalPos;
    document.getElementById('pendingPos').textContent = stats.pendingPos;
    document.getElementById('totalSuppliers').textContent = stats.totalSuppliers;
    document.getElementById('totalSpent').textContent = formatCurrency(stats.totalSpent);
}

/**
 * Calculate procurement statistics
 */
function calculateProcurementStats() {
    const totalPos = procurementState.pos.length;
    const pendingPos = procurementState.pos.filter(po => po.status === 'Pending').length;
    const totalSuppliers = procurementState.suppliers.length;
    
    const totalSpent = procurementState.pos
        .filter(po => po.status !== 'Cancelled')
        .reduce((sum, po) => sum + (po.total_amount || 0), 0);
    
    return {
        totalPos,
        pendingPos,
        totalSuppliers,
        totalSpent
    };
}

/**
 * Setup PO Item Calculations
 */
function setupPOItemCalculations() {
    const itemsContainer = document.getElementById('poItems');
    
    if (itemsContainer) {
        itemsContainer.addEventListener('change', function(e) {
            if (e.target.classList.contains('po-quantity') || 
                e.target.classList.contains('po-price')) {
                calculateLineTotal(e.target.closest('.po-item-row'));
                calculatePOTotal();
            }
        });
    }
}

/**
 * Calculate line total for PO item
 */
function calculateLineTotal(itemRow) {
    const quantity = parseFloat(itemRow.querySelector('.po-quantity').value) || 0;
    const price = parseFloat(itemRow.querySelector('.po-price').value) || 0;
    const lineTotal = quantity * price;
    
    itemRow.querySelector('.po-line-total').textContent = formatCurrency(lineTotal);
    
    return lineTotal;
}

/**
 * Calculate total PO amount with tax
 */
function calculatePOTotal() {
    const itemRows = document.querySelectorAll('.po-item-row');
    let subtotal = 0;
    
    itemRows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.po-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.po-price').value) || 0;
        subtotal += quantity * price;
    });
    
    const tax = subtotal * 0.10; // 10% tax
    const total = subtotal + tax;
    
    // Update summary
    document.getElementById('poSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('poTax').textContent = formatCurrency(tax);
    document.getElementById('poTotal').textContent = formatCurrency(total);
    
    return { subtotal, tax, total };
}

/**
 * Add new PO item row
 */
function addPoItem() {
    const itemsContainer = document.getElementById('poItems');
    const newRow = createPoItemRow();
    itemsContainer.appendChild(newRow);
    setupPOItemCalculations();
    calculatePOTotal();
}

/**
 * Create PO item row HTML
 */
function createPoItemRow() {
    const div = document.createElement('div');
    div.className = 'po-item-row p-4 border border-gray-300 rounded-lg bg-gray-50';
    div.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Material</label>
                <select class="po-material w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select material</option>
                    <option value="cotton">Cotton Fabric - Grade A</option>
                    <option value="polyester">Polyester Blend</option>
                    <option value="silk">Silk Material</option>
                    <option value="wool">Wool Yarn</option>
                </select>
            </div>

            <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                <input type="number" class="po-quantity w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" min="1" value="100">
            </div>

            <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                <select class="po-unit w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Kg</option>
                    <option>Meters</option>
                    <option>Pieces</option>
                    <option>Rolls</option>
                </select>
            </div>

            <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Unit Price ($)</label>
                <input type="number" class="po-price w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" value="15.50">
            </div>

            <div class="flex items-end">
                <button type="button" onclick="removePoItem(this)" class="w-full px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm font-medium transition">Remove</button>
            </div>
        </div>
        <div class="mt-2 text-right">
            <span class="text-sm text-gray-600">Line Total: <span class="po-line-total font-semibold">$1,550.00</span></span>
        </div>
    `;
    return div;
}

/**
 * Remove PO item row
 */
function removePoItem(button) {
    const itemRow = button.closest('.po-item-row');
    
    if (document.querySelectorAll('.po-item-row').length > 1) {
        itemRow.remove();
        calculatePOTotal();
    } else {
        showNotification('Must have at least one item', 'warning');
    }
}

/**
 * Handle Create PO Form Submission
 */
async function handleCreatePO(e) {
    e.preventDefault();
    
    // Collect form data
    const supplierId = document.getElementById('poSupplier').value;
    const deliveryDate = document.getElementById('poDeliveryDate').value;
    const notes = document.getElementById('poNotes').value;
    
    // Collect items
    const items = [];
    document.querySelectorAll('.po-item-row').forEach(row => {
        items.push({
            material_id: row.querySelector('.po-material').value,
            quantity: parseFloat(row.querySelector('.po-quantity').value),
            unit: row.querySelector('.po-unit').value,
            unit_price: parseFloat(row.querySelector('.po-price').value)
        });
    });
    
    // Validate
    if (!supplierId || !deliveryDate || items.length === 0) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    // Calculate total
    const { subtotal, tax, total } = calculatePOTotal();
    
    // Prepare payload
    const payload = {
        supplier_id: supplierId,
        expected_delivery_date: deliveryDate,
        notes: notes,
        items: items,
        total_amount: total
    };
    
    try {
        // Send to API
        const response = await apiRequest(PROCUREMENT_API.POS, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        showNotification('Purchase Order created successfully!', 'success');
        
        // Reset form
        document.getElementById('poForm').reset();
        
        // Reload data
        await loadProcurementData();
        
        // Navigate back to dashboard
        setTimeout(() => {
            loadOperation('procurement-dashboard');
        }, 1500);
        
    } catch (error) {
        console.error('Error creating PO:', error);
        showNotification('Failed to create Purchase Order', 'error');
    }
}

/**
 * Show Add Supplier Modal
 */
function showAddSupplierModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add New Supplier</h3>
                <button type="button" class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <form id="supplierForm" onsubmit="handleAddSupplier(event)">
                <div class="modal-body space-y-4">
                    <div class="form-group">
                        <label for="supplierName">Supplier Name *</label>
                        <input type="text" id="supplierName" required class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="supplierEmail">Email *</label>
                        <input type="email" id="supplierEmail" required class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="supplierPhone">Phone</label>
                        <input type="tel" id="supplierPhone" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="supplierAddress">Address</label>
                        <input type="text" id="supplierAddress" class="form-control">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary-procurement" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button type="submit" class="btn-primary-procurement">Add Supplier</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * Handle Add Supplier
 */
async function handleAddSupplier(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('supplierName').value,
        email: document.getElementById('supplierEmail').value,
        phone: document.getElementById('supplierPhone').value,
        address: document.getElementById('supplierAddress').value
    };
    
    try {
        const response = await apiRequest(PROCUREMENT_API.SUPPLIERS, {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showNotification('Supplier added successfully!', 'success');
        document.querySelector('.modal-overlay').remove();
        
        // Reload suppliers
        await loadProcurementData();
        
    } catch (error) {
        console.error('Error adding supplier:', error);
        showNotification('Failed to add supplier', 'error');
    }
}

/**
 * View PO Details
 */
async function viewPODetails(poId) {
    try {
        const response = await apiRequest(`${PROCUREMENT_API.POS}/${poId}`);
        procurementState.currentPO = response.data;
        loadOperation('po-details');
    } catch (error) {
        console.error('Error fetching PO details:', error);
        showNotification('Failed to load PO details', 'error');
    }
}

/**
 * Filter POs by status
 */
function filterPOsByStatus(status) {
    procurementState.filters.status = status;
    updateProcurementDashboard();
}

/**
 * Export POs to CSV
 */
function exportPOsToCSV() {
    const data = procurementState.pos.map(po => ({
        'PO Number': po.po_number,
        'Supplier': po.supplier_name,
        'Amount': po.total_amount,
        'Status': po.status,
        'Due Date': formatDate(po.expected_delivery_date)
    }));
    
    exportToCSV(data, 'purchase-orders.csv');
}

/**
 * Print PO
 */
function printPO(poId) {
    const po = procurementState.currentPO;
    if (!po) return;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
        <html>
        <head>
            <title>Purchase Order ${po.po_number}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { border-bottom: 2px solid #333; padding-bottom: 10px; }
                .section { margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #f5f5f5; font-weight: bold; }
                .total { font-size: 18px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Purchase Order ${po.po_number}</h1>
                <p>Date: ${formatDate(po.order_date)}</p>
            </div>
            
            <div class="section">
                <h3>Supplier Information</h3>
                <p><strong>${po.supplier_name}</strong></p>
                <p>${po.supplier_email}</p>
                <p>${po.supplier_phone}</p>
            </div>
            
            <div class="section">
                <h3>Order Details</h3>
                <table>
                    <tr>
                        <th>Material</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Unit Price</th>
                        <th>Amount</th>
                    </tr>
                    ${po.items.map(item => `
                        <tr>
                            <td>${item.material_name}</td>
                            <td>${item.quantity}</td>
                            <td>${item.unit}</td>
                            <td>$${item.unit_price.toFixed(2)}</td>
                            <td>$${(item.quantity * item.unit_price).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
            
            <div class="section">
                <div style="text-align: right;">
                    <p>Subtotal: $${po.subtotal.toFixed(2)}</p>
                    <p>Tax (10%): $${(po.subtotal * 0.1).toFixed(2)}</p>
                    <p class="total">Total: $${po.total_amount.toFixed(2)}</p>
                </div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Initialize when module loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProcurementModule);
} else {
    initProcurementModule();
}

export {
    initProcurementModule,
    loadProcurementData,
    addPoItem,
    removePoItem,
    viewPODetails,
    filterPOsByStatus,
    exportPOsToCSV,
    printPO
};
