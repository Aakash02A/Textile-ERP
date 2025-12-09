/**
 * ERP Core Handlers - Global Functions
 * Centralized event handlers and operations for all modules
 */

// ============================================
// PROCUREMENT HANDLERS
// ============================================

async function savePO(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    // Validation schema
    const schema = {
        supplierId: ['required'],
        poDate: ['required', 'date'],
        dueDate: ['required', 'date'],
        taxRate: ['required', { type: 'min', value: 0 }, { type: 'max', value: 100 }],
        notes: []
    };

    // Get form data
    const formData = Utils.getFormData(form);

    // Validate
    const errors = validator.validate(formData, schema);
    if (!validator.displayErrors(form, errors)) {
        return;
    }

    try {
        LoadingManager.show(submitBtn, 'Creating PO...');

        // Prepare line items
        const lineItems = [];
        const lineItemRows = form.querySelectorAll('[data-line-item]');
        lineItemRows.forEach(row => {
            const materialId = row.querySelector('[name="materialId"]')?.value;
            const quantity = row.querySelector('[name="quantity"]')?.value;
            const unitPrice = row.querySelector('[name="unitPrice"]')?.value;

            if (materialId && quantity && unitPrice) {
                lineItems.push({
                    materialId,
                    quantity: parseFloat(quantity),
                    unitPrice: parseFloat(unitPrice),
                    total: parseFloat(quantity) * parseFloat(unitPrice)
                });
            }
        });

        if (lineItems.length === 0) {
            notify.error('Add at least one line item to the PO');
            LoadingManager.hide(submitBtn);
            return;
        }

        const poData = {
            supplierId: formData.supplierId,
            poDate: formData.poDate,
            dueDate: formData.dueDate,
            taxRate: parseFloat(formData.taxRate),
            notes: formData.notes,
            lineItems: lineItems,
            subtotal: lineItems.reduce((sum, item) => sum + item.total, 0),
            tax: 0,
            total: 0,
            status: 'Draft'
        };

        // Calculate totals
        poData.tax = poData.subtotal * (poData.taxRate / 100);
        poData.total = poData.subtotal + poData.tax;

        // Save via API
        const result = await erp.createPurchaseOrder(poData);

        notify.success(`PO created successfully: ${result.id}`);
        form.reset();
        validator.clearErrors(form);

        // Redirect to PO list after 1 second
        setTimeout(() => {
            window.location.href = '../procurement/po-list.html';
        }, 1000);

    } catch (error) {
        notify.error(`Error creating PO: ${error.message}`);
    } finally {
        LoadingManager.hide(submitBtn);
    }
}

async function openCreatePO() {
    window.location.href = '../procurement/create-po.html';
}

async function filterPOs(event) {
    const filters = {
        status: document.querySelector('[name="filterStatus"]')?.value || '',
        supplier: document.querySelector('[name="filterSupplier"]')?.value || '',
        poNumber: document.querySelector('[name="filterPONumber"]')?.value || ''
    };

    try {
        const allPOs = await erp.loadPurchaseOrders();

        let filtered = allPOs;

        if (filters.status) {
            filtered = filtered.filter(po => po.status === filters.status);
        }

        if (filters.supplier) {
            filtered = filtered.filter(po => po.supplierName.toLowerCase().includes(filters.supplier.toLowerCase()));
        }

        if (filters.poNumber) {
            filtered = filtered.filter(po => po.id.includes(filters.poNumber.toUpperCase()));
        }

        // Update table
        renderPOTable(filtered);
        notify.info(`Found ${filtered.length} POs matching filters`);

    } catch (error) {
        notify.error(`Error filtering POs: ${error.message}`);
    }
}

async function openPODetails(poId) {
    try {
        const po = await erp.getPurchaseOrder(poId);
        
        const content = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-gray-500 text-sm">PO Number</p>
                        <p class="text-lg font-semibold">${po.id}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 text-sm">Status</p>
                        <span class="inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            po.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            po.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                            po.status === 'Received' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                        }">
                            ${po.status}
                        </span>
                    </div>
                    <div>
                        <p class="text-gray-500 text-sm">Supplier</p>
                        <p class="font-medium">${po.supplierName}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 text-sm">Amount</p>
                        <p class="text-lg font-semibold">${Utils.formatCurrency(po.amount)}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 text-sm">PO Date</p>
                        <p>${Utils.formatDate(po.date)}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 text-sm">Due Date</p>
                        <p>${Utils.formatDate(po.dueDate)}</p>
                    </div>
                </div>
            </div>
        `;

        modalManager.create('po-details-modal', {
            title: `PO Details - ${po.id}`,
            content: content,
            width: 'max-w-lg',
            buttons: [
                { label: 'Close', onclick: "modalManager.close('po-details-modal')" }
            ]
        });

        modalManager.open('po-details-modal');

    } catch (error) {
        notify.error(`Error loading PO details: ${error.message}`);
    }
}

async function deletePO(poId) {
    modalManager.confirm(
        'Delete PO',
        `Are you sure you want to delete PO ${poId}? This action cannot be undone.`,
        async () => {
            try {
                LoadingManager.showOverlay('Deleting PO...');
                await erp.deletePurchaseOrder(poId);
                notify.success(`PO ${poId} deleted successfully`);
                LoadingManager.hideOverlay();
                location.reload();
            } catch (error) {
                LoadingManager.hideOverlay();
                notify.error(`Error deleting PO: ${error.message}`);
            }
        }
    );
}

function renderPOTable(pos) {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;

    tbody.innerHTML = pos.map(po => `
        <tr class="border-b hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">${po.id}</td>
            <td class="px-6 py-4">${po.supplierName}</td>
            <td class="px-6 py-4">${Utils.formatDate(po.date)}</td>
            <td class="px-6 py-4 font-semibold">${Utils.formatCurrency(po.amount)}</td>
            <td class="px-6 py-4">
                <span class="inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    po.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    po.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                    po.status === 'Received' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                }">
                    ${po.status}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="flex gap-2">
                    <button onclick="openPODetails('${po.id}')" class="text-blue-600 hover:text-blue-800" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="deletePO('${po.id}')" class="text-red-600 hover:text-red-800" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ============================================
// SALES HANDLERS
// ============================================

async function saveSalesOrder(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const schema = {
        customerId: ['required'],
        orderDate: ['required', 'date'],
        dueDate: ['required', 'date'],
        notes: []
    };

    const formData = Utils.getFormData(form);
    const errors = validator.validate(formData, schema);
    if (!validator.displayErrors(form, errors)) {
        return;
    }

    try {
        LoadingManager.show(submitBtn, 'Creating Sales Order...');

        const soData = {
            customerId: formData.customerId,
            orderDate: formData.orderDate,
            dueDate: formData.dueDate,
            notes: formData.notes,
            status: 'Pending',
            items: []
        };

        const result = await erp.createSalesOrder(soData);
        notify.success(`Sales Order created: ${result.id}`);
        form.reset();

        setTimeout(() => {
            window.location.href = '../sales/sales-orders.html';
        }, 1000);

    } catch (error) {
        notify.error(`Error creating Sales Order: ${error.message}`);
    } finally {
        LoadingManager.hide(submitBtn);
    }
}

async function filterSalesOrders() {
    const filters = {
        status: document.querySelector('[name="filterStatus"]')?.value || '',
        customer: document.querySelector('[name="filterCustomer"]')?.value || ''
    };

    try {
        let orders = await erp.loadSalesOrders();

        if (filters.status) {
            orders = orders.filter(o => o.status === filters.status);
        }

        if (filters.customer) {
            orders = orders.filter(o => o.customerName?.toLowerCase().includes(filters.customer.toLowerCase()));
        }

        renderSalesOrdersTable(orders);
        notify.info(`Found ${orders.length} sales orders`);

    } catch (error) {
        notify.error(`Error filtering orders: ${error.message}`);
    }
}

async function openCreateSalesOrder() {
    window.location.href = '../sales/create-sales-order.html';
}

function renderSalesOrdersTable(orders) {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;

    tbody.innerHTML = orders.map(order => `
        <tr class="border-b hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">${order.id}</td>
            <td class="px-6 py-4">${order.customerName || 'N/A'}</td>
            <td class="px-6 py-4">${Utils.formatDate(order.orderDate)}</td>
            <td class="px-6 py-4 font-semibold">${Utils.formatCurrency(order.total || 0)}</td>
            <td class="px-6 py-4">
                <span class="inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'Shipped' ? 'bg-green-100 text-green-800' :
                    order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                }">
                    ${order.status}
                </span>
            </td>
        </tr>
    `).join('');
}

// ============================================
// CUSTOMER HANDLERS
// ============================================

async function saveCustomer(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const schema = {
        name: ['required'],
        email: ['required', 'email'],
        phone: ['required', 'phone'],
        city: ['required'],
        address: ['required']
    };

    const formData = Utils.getFormData(form);
    const errors = validator.validate(formData, schema);
    if (!validator.displayErrors(form, errors)) {
        return;
    }

    try {
        LoadingManager.show(submitBtn, 'Creating Customer...');

        const customerData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
            address: formData.address
        };

        const result = await erp.createCustomer(customerData);
        notify.success(`Customer created: ${result.name}`);
        form.reset();

        setTimeout(() => {
            window.location.href = '../sales/customers.html';
        }, 1000);

    } catch (error) {
        notify.error(`Error creating customer: ${error.message}`);
    } finally {
        LoadingManager.hide(submitBtn);
    }
}

async function filterCustomers() {
    const searchTerm = document.querySelector('[name="searchCustomer"]')?.value || '';

    try {
        let customers = await erp.loadCustomers();

        if (searchTerm) {
            customers = customers.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.city.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        renderCustomersTable(customers);
        notify.info(`Found ${customers.length} customers`);

    } catch (error) {
        notify.error(`Error filtering customers: ${error.message}`);
    }
}

function renderCustomersTable(customers) {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;

    tbody.innerHTML = customers.map(customer => `
        <tr class="border-b hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">${customer.name}</td>
            <td class="px-6 py-4">${customer.email}</td>
            <td class="px-6 py-4">${customer.phone}</td>
            <td class="px-6 py-4">${customer.city}</td>
            <td class="px-6 py-4 text-right font-semibold">${customer.orders || 0}</td>
        </tr>
    `).join('');
}

// ============================================
// INVENTORY HANDLERS
// ============================================

async function loadMaterials() {
    try {
        LoadingManager.showOverlay('Loading materials...');
        const materials = await erp.loadInventory();
        renderMaterialsTable(materials);
        LoadingManager.hideOverlay();
    } catch (error) {
        LoadingManager.hideOverlay();
        notify.error(`Error loading materials: ${error.message}`);
    }
}

async function filterMaterials() {
    const searchTerm = document.querySelector('[name="searchMaterial"]')?.value || '';
    const categoryFilter = document.querySelector('[name="filterCategory"]')?.value || '';

    try {
        let materials = await erp.loadInventory();

        if (searchTerm) {
            materials = materials.filter(m =>
                m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.code.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter) {
            materials = materials.filter(m => m.category === categoryFilter);
        }

        renderMaterialsTable(materials);
        notify.info(`Found ${materials.length} materials`);

    } catch (error) {
        notify.error(`Error filtering materials: ${error.message}`);
    }
}

function renderMaterialsTable(materials) {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;

    tbody.innerHTML = materials.map(material => `
        <tr class="border-b hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">${material.code}</td>
            <td class="px-6 py-4">${material.name}</td>
            <td class="px-6 py-4">${material.category}</td>
            <td class="px-6 py-4 text-center">
                <span class="px-2 py-1 rounded-full text-sm font-medium ${
                    material.quantity > 200 ? 'bg-green-100 text-green-800' :
                    material.quantity > 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }">
                    ${material.quantity} ${material.unit}
                </span>
            </td>
            <td class="px-6 py-4 font-semibold">${Utils.formatCurrency(material.price)}</td>
            <td class="px-6 py-4 font-semibold">${Utils.formatCurrency(material.quantity * material.price)}</td>
        </tr>
    `).join('');
}

// ============================================
// PRODUCTION HANDLERS
// ============================================

async function saveWorkOrder(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const schema = {
        productName: ['required'],
        quantity: ['required', 'positive'],
        dueDate: ['required', 'date'],
        priority: ['required']
    };

    const formData = Utils.getFormData(form);
    const errors = validator.validate(formData, schema);
    if (!validator.displayErrors(form, errors)) {
        return;
    }

    try {
        LoadingManager.show(submitBtn, 'Creating Work Order...');

        const woData = {
            productName: formData.productName,
            quantity: parseInt(formData.quantity),
            dueDate: formData.dueDate,
            priority: formData.priority,
            status: 'Pending',
            progress: 0
        };

        const result = await erp.createWorkOrder(woData);
        notify.success(`Work Order created: ${result.id}`);
        form.reset();

        setTimeout(() => {
            window.location.href = '../production/work-orders.html';
        }, 1000);

    } catch (error) {
        notify.error(`Error creating work order: ${error.message}`);
    } finally {
        LoadingManager.hide(submitBtn);
    }
}

async function loadWorkOrders() {
    try {
        LoadingManager.showOverlay('Loading work orders...');
        const workOrders = await erp.loadWorkOrders();
        renderWorkOrdersTable(workOrders);
        LoadingManager.hideOverlay();
    } catch (error) {
        LoadingManager.hideOverlay();
        notify.error(`Error loading work orders: ${error.message}`);
    }
}

async function filterWorkOrders() {
    const statusFilter = document.querySelector('[name="filterStatus"]')?.value || '';

    try {
        let workOrders = await erp.loadWorkOrders();

        if (statusFilter) {
            workOrders = workOrders.filter(wo => wo.status === statusFilter);
        }

        renderWorkOrdersTable(workOrders);
        notify.info(`Found ${workOrders.length} work orders`);

    } catch (error) {
        notify.error(`Error filtering work orders: ${error.message}`);
    }
}

async function updateWorkOrderProgress(woId) {
    const currentWO = (await erp.loadWorkOrders()).find(wo => wo.id === woId);

    const content = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Progress (%)</label>
                <input type="number" id="progressInput" min="0" max="100" value="${currentWO.progress}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select id="statusSelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="Pending" ${currentWO.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="In Progress" ${currentWO.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Completed" ${currentWO.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
            </div>
        </div>
    `;

    modalManager.create('update-wo-modal', {
        title: `Update Work Order - ${woId}`,
        content: content,
        buttons: [
            { label: 'Cancel', onclick: "modalManager.close('update-wo-modal')" },
            { 
                label: 'Update', 
                type: 'primary',
                onclick: `updateWorkOrderSubmit('${woId}')`
            }
        ]
    });

    modalManager.open('update-wo-modal');
}

async function updateWorkOrderSubmit(woId) {
    try {
        const progress = document.getElementById('progressInput').value;
        const status = document.getElementById('statusSelect').value;

        await erp.updateWorkOrder(woId, { progress: parseInt(progress), status });
        notify.success('Work order updated');
        modalManager.close('update-wo-modal');
        loadWorkOrders();

    } catch (error) {
        notify.error(`Error updating work order: ${error.message}`);
    }
}

function renderWorkOrdersTable(workOrders) {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;

    tbody.innerHTML = workOrders.map(wo => `
        <tr class="border-b hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">${wo.id}</td>
            <td class="px-6 py-4">${wo.productName}</td>
            <td class="px-6 py-4 text-center">${wo.quantity}</td>
            <td class="px-6 py-4">
                <div class="w-32 bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${wo.progress}%"></div>
                </div>
                <span class="text-xs text-gray-500">${wo.progress}%</span>
            </td>
            <td class="px-6 py-4">
                <span class="inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    wo.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    wo.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                }">
                    ${wo.status}
                </span>
            </td>
            <td class="px-6 py-4">
                <button onclick="updateWorkOrderProgress('${wo.id}')" class="text-blue-600 hover:text-blue-800">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ============================================
// QUALITY HANDLERS
// ============================================

async function saveQCLog(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const schema = {
        batchId: ['required'],
        inspectionDate: ['required', 'date'],
        defectsFound: ['required'],
        result: ['required']
    };

    const formData = Utils.getFormData(form);
    const errors = validator.validate(formData, schema);
    if (!validator.displayErrors(form, errors)) {
        return;
    }

    try {
        LoadingManager.show(submitBtn, 'Saving QC Log...');

        const qcData = {
            batchId: formData.batchId,
            inspectionDate: formData.inspectionDate,
            defectsFound: parseInt(formData.defectsFound),
            result: formData.result,
            notes: formData.notes
        };

        const result = await erp.createQCLog(qcData);
        notify.success(`QC Log saved: ${result.id}`);
        form.reset();

        setTimeout(() => {
            form.reset();
        }, 1000);

    } catch (error) {
        notify.error(`Error saving QC Log: ${error.message}`);
    } finally {
        LoadingManager.hide(submitBtn);
    }
}

// ============================================
// INITIALIZE GLOBAL NAMESPACE
// ============================================

// Ensure erp (ERPHelper) is available globally
const erp = window.erp || new ERPHelper();
window.erp = erp;
