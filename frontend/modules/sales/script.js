// Sales Module

let salesState = {
    orders: [],
    customers: [],
    currentFilter: 'all',
    lineItems: []
};

// Initialize Sales Module
function initSalesModule() {
    loadSalesData();
    setupSalesEventListeners();
    console.log('Sales module initialized');
}

// Setup event listeners
function setupSalesEventListeners() {
    const soForm = document.getElementById('soForm');
    const customerForm = document.getElementById('customerForm');
    const addLineItemBtn = document.getElementById('addLineItemBtn');

    if (soForm) {
        soForm.addEventListener('submit', handleCreateSalesOrder);
    }

    if (customerForm) {
        customerForm.addEventListener('submit', handleCreateCustomer);
    }

    if (addLineItemBtn) {
        addLineItemBtn.addEventListener('click', addSoItem);
    }

    // Update line item totals
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('line-item-qty') || e.target.classList.contains('line-item-price')) {
            updateLineItemTotal(e.target);
            updateOrderTotal();
        }
    });
}

// Load sales data
async function loadSalesData() {
    try {
        const [ordersData, customersData] = await Promise.all([
            fetchSalesOrders(),
            fetchCustomers()
        ]);

        salesState.orders = ordersData;
        salesState.customers = customersData;

        updateSalesDashboard();
        updateSalesOrdersTable();
        updateCustomersList();
    } catch (error) {
        console.error('Error loading sales data:', error);
        showSalesNotification('Failed to load sales data', 'error');
    }
}

// Fetch Sales Orders
async function fetchSalesOrders() {
    try {
        const response = await apiRequest('/api/v1/sales/orders');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching sales orders:', error);
        // Return sample data
        return [
            {
                sales_order_id: 'so001',
                order_number: 'SO-2025-001',
                customer_name: 'ABC Textile Corp',
                order_date: '2025-01-15',
                total_amount: 5200.50,
                status: 'delivered',
                line_items: [
                    { product_name: 'Cotton Fabric', quantity: 100, unit_price: 52.00 }
                ]
            }
        ];
    }
}

// Fetch Customers
async function fetchCustomers() {
    try {
        const response = await apiRequest('/api/v1/sales/customers');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
}

// Update Sales Dashboard
function updateSalesDashboard() {
    const totalRevenue = salesState.orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const activeOrders = salesState.orders.filter(o => o.status !== 'delivered').length;
    const totalCustomers = salesState.customers.length;
    const deliveredOrders = salesState.orders.filter(o => o.status === 'delivered').length;
    const fulfillmentRate = salesState.orders.length > 0 ? (deliveredOrders / salesState.orders.length) * 100 : 0;

    const kpiCards = document.querySelectorAll('.grid > div');
    if (kpiCards[0]) {
        kpiCards[0].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Total Sales</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">$${(totalRevenue / 1000).toFixed(1)}K</p>
            <p class="text-green-600 text-sm mt-2">↑ 15% vs last month</p>
        `;
    }

    if (kpiCards[1]) {
        kpiCards[1].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Active Orders</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${activeOrders}</p>
            <p class="text-blue-600 text-sm mt-2">Pending delivery</p>
        `;
    }

    if (kpiCards[2]) {
        kpiCards[2].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Total Customers</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${totalCustomers}</p>
            <p class="text-green-600 text-sm mt-2">↑ 3% vs last month</p>
        `;
    }

    if (kpiCards[3]) {
        kpiCards[3].innerHTML = `
            <p class="text-gray-600 text-sm font-medium">Fulfillment Rate</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${fulfillmentRate.toFixed(1)}%</p>
            <p class="text-green-600 text-sm mt-2">Orders delivered</p>
        `;
    }
}

// Update Sales Orders Table
function updateSalesOrdersTable() {
    const tableBody = document.getElementById('salesOrdersTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    salesState.orders.slice(0, 10).forEach(order => {
        const row = document.createElement('tr');
        const statusClass = `sales-badge ${order.status}`;

        row.innerHTML = `
            <td class="px-6 py-4 text-sm text-gray-700">${order.order_number || 'N/A'}</td>
            <td class="px-6 py-4 text-sm text-gray-700">${order.customer_name || 'N/A'}</td>
            <td class="px-6 py-4 text-sm text-gray-700">${order.order_date?.split('T')[0] || 'N/A'}</td>
            <td class="px-6 py-4 text-sm text-right text-gray-700">$${(order.total_amount || 0).toFixed(2)}</td>
            <td class="px-6 py-4 text-sm">
                <span class="${statusClass}">${(order.status || 'pending').toUpperCase()}</span>
            </td>
            <td class="px-6 py-4 text-sm">
                <button onclick="viewSalesOrder('${order.sales_order_id}')" class="text-indigo-600 hover:text-indigo-900 font-medium">View</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Update Customers List
function updateCustomersList() {
    const customersList = document.getElementById('customersList');
    if (!customersList) return;

    customersList.innerHTML = '';

    salesState.customers.slice(0, 6).forEach(customer => {
        const card = document.createElement('div');
        card.className = 'customer-card';
        card.innerHTML = `
            <p class="customer-name">${customer.company_name || customer.customer_name || 'N/A'}</p>
            <p class="customer-info">Contact: ${customer.contact_person || 'N/A'}</p>
            <p class="customer-info">Email: ${customer.email || 'N/A'}</p>
            <p class="customer-info">Phone: ${customer.phone || 'N/A'}</p>
            <p class="customer-info">Credit Limit: $${(customer.credit_limit || 0).toLocaleString()}</p>
            <div class="customer-actions">
                <button onclick="viewCustomer('${customer.customer_id}')" class="customer-action-btn">View</button>
                <button onclick="editCustomer('${customer.customer_id}')" class="customer-action-btn">Edit</button>
            </div>
        `;
        customersList.appendChild(card);
    });
}

// Handle Create Sales Order
async function handleCreateSalesOrder(e) {
    e.preventDefault();

    const soItems = Array.from(document.querySelectorAll('[data-line-item]')).map(item => ({
        product_id: item.querySelector('.line-item-product').value,
        product_name: item.querySelector('.line-item-product').options[item.querySelector('.line-item-product').selectedIndex]?.text || '',
        quantity: parseInt(item.querySelector('.line-item-qty').value) || 0,
        unit_price: parseFloat(item.querySelector('.line-item-price').value) || 0
    }));

    if (soItems.length === 0) {
        showSalesNotification('Please add at least one line item', 'error');
        return;
    }

    const totalAmount = soItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    const formData = {
        customer_id: document.getElementById('soCustomer')?.value,
        order_date: document.getElementById('soDate')?.value || new Date().toISOString().split('T')[0],
        delivery_date: document.getElementById('soDeliveryDate')?.value,
        line_items: soItems,
        total_amount: totalAmount,
        notes: document.getElementById('soNotes')?.value || '',
        status: 'pending'
    };

    // Validate required fields
    if (!formData.customer_id || soItems.length === 0) {
        showSalesNotification('Please fill in all required fields', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/v1/sales/orders', {
            method: 'POST',
            body: JSON.stringify(formData)
        });

        showSalesNotification('Sales order created successfully', 'success');
        document.getElementById('soForm').reset();
        salesState.lineItems = [];

        // Reset line items UI
        const lineItemsContainer = document.getElementById('lineItemsContainer');
        if (lineItemsContainer) {
            lineItemsContainer.innerHTML = '';
        }

        // Reload data
        await loadSalesData();
    } catch (error) {
        console.error('Error creating sales order:', error);
        showSalesNotification('Failed to create sales order', 'error');
    }
}

// Handle Create Customer
async function handleCreateCustomer(e) {
    e.preventDefault();

    const formData = {
        company_name: document.getElementById('customerCompany')?.value,
        contact_person: document.getElementById('customerContact')?.value,
        email: document.getElementById('customerEmail')?.value,
        phone: document.getElementById('customerPhone')?.value,
        address: document.getElementById('customerAddress')?.value,
        city: document.getElementById('customerCity')?.value,
        credit_limit: parseFloat(document.getElementById('customerCredit')?.value) || 0
    };

    // Validate required fields
    if (!formData.company_name || !formData.contact_person || !formData.email) {
        showSalesNotification('Please fill in all required fields', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/v1/sales/customers', {
            method: 'POST',
            body: JSON.stringify(formData)
        });

        showSalesNotification('Customer created successfully', 'success');
        document.getElementById('customerForm').reset();

        // Reload data
        await loadSalesData();
    } catch (error) {
        console.error('Error creating customer:', error);
        showSalesNotification('Failed to create customer', 'error');
    }
}

// Add Sales Order Line Item
function addSoItem() {
    const lineItemsContainer = document.getElementById('lineItemsContainer');
    if (!lineItemsContainer) return;

    const itemId = 'li_' + Date.now();
    const lineItem = document.createElement('div');
    lineItem.className = 'line-item';
    lineItem.setAttribute('data-line-item', itemId);

    lineItem.innerHTML = `
        <select class="line-item-input line-item-product" required>
            <option value="">Select Product</option>
            <option value="prod001">Cotton Fabric - $50/unit</option>
            <option value="prod002">Silk Blend - $75/unit</option>
            <option value="prod003">Polyester Mix - $40/unit</option>
            <option value="prod004">Wool Blend - $85/unit</option>
        </select>
        <input type="number" class="line-item-input line-item-qty" placeholder="Qty" min="1" value="1" required>
        <input type="number" class="line-item-input line-item-price" placeholder="Price" min="0" step="0.01" required>
        <div class="line-item-total">$0.00</div>
        <button type="button" class="remove-line-item-btn" onclick="removeSoItem('${itemId}')">Remove</button>
    `;

    lineItemsContainer.appendChild(lineItem);
    updateOrderTotal();
}

// Remove Sales Order Line Item
function removeSoItem(itemId) {
    const lineItem = document.querySelector(`[data-line-item="${itemId}"]`);
    if (lineItem) {
        lineItem.remove();
        updateOrderTotal();
    }
}

// Update Line Item Total
function updateLineItemTotal(input) {
    const lineItem = input.closest('[data-line-item]');
    if (!lineItem) return;

    const qty = parseFloat(lineItem.querySelector('.line-item-qty').value) || 0;
    const price = parseFloat(lineItem.querySelector('.line-item-price').value) || 0;
    const total = qty * price;

    const totalElement = lineItem.querySelector('.line-item-total');
    if (totalElement) {
        totalElement.textContent = '$' + total.toFixed(2);
    }
}

// Update Order Total
function updateOrderTotal() {
    let total = 0;
    document.querySelectorAll('[data-line-item]').forEach(item => {
        const qty = parseFloat(item.querySelector('.line-item-qty').value) || 0;
        const price = parseFloat(item.querySelector('.line-item-price').value) || 0;
        total += qty * price;
    });

    const orderTotalElement = document.getElementById('orderTotal');
    if (orderTotalElement) {
        orderTotalElement.textContent = '$' + total.toFixed(2);
    }
}

// View Sales Order
function viewSalesOrder(orderId) {
    const order = salesState.orders.find(o => o.sales_order_id === orderId);
    if (!order) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';

    let itemsHtml = '';
    if (order.line_items) {
        order.line_items.forEach(item => {
            itemsHtml += `
                <tr>
                    <td class="px-4 py-2 text-sm">${item.product_name || 'N/A'}</td>
                    <td class="px-4 py-2 text-sm text-right">${item.quantity || 0}</td>
                    <td class="px-4 py-2 text-sm text-right">$${(item.unit_price || 0).toFixed(2)}</td>
                    <td class="px-4 py-2 text-sm text-right">$${((item.quantity || 0) * (item.unit_price || 0)).toFixed(2)}</td>
                </tr>
            `;
        });
    }

    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Sales Order: ${order.order_number}</h3>
            <div class="space-y-4 mb-6">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-600">Customer</p>
                        <p class="text-gray-900 font-medium">${order.customer_name || 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Order Date</p>
                        <p class="text-gray-900 font-medium">${order.order_date?.split('T')[0] || 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Status</p>
                        <span class="sales-badge ${order.status}">${(order.status || 'pending').toUpperCase()}</span>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Total Amount</p>
                        <p class="text-gray-900 font-medium text-lg">$${(order.total_amount || 0).toFixed(2)}</p>
                    </div>
                </div>
                <table class="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="px-4 py-2 text-left text-sm font-medium">Product</th>
                            <th class="px-4 py-2 text-right text-sm font-medium">Qty</th>
                            <th class="px-4 py-2 text-right text-sm font-medium">Price</th>
                            <th class="px-4 py-2 text-right text-sm font-medium">Total</th>
                        </tr>
                    </thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

// View Customer
function viewCustomer(customerId) {
    const customer = salesState.customers.find(c => c.customer_id === customerId);
    if (!customer) return;

    alert(`Customer: ${customer.company_name}\nEmail: ${customer.email}\nCredit Limit: $${customer.credit_limit}`);
}

// Edit Customer
function editCustomer(customerId) {
    showSalesNotification('Edit functionality coming soon', 'info');
}

// Show notification
function showSalesNotification(message, type = 'info') {
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
    if (document.getElementById('soForm')) {
        initSalesModule();
    }
});
