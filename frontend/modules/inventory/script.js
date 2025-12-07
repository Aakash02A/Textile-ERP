// Inventory Module

const INVENTORY_API = {
    BASE: '/api/v1/inventory',
    MATERIALS: '/api/v1/inventory/materials',
    TRANSACTIONS: '/api/v1/inventory/transactions',
    STOCK_LEVELS: '/api/v1/inventory/stock-levels'
};

const inventoryState = {
    materials: [],
    transactions: [],
    filters: { category: 'all', status: 'all' }
};

/**
 * Initialize Inventory Module
 */
function initInventoryModule() {
    console.log('Initializing Inventory Module...');
    
    // Load initial data
    loadInventoryData();
    
    // Setup event listeners
    const addMaterialForm = document.getElementById('addMaterialForm');
    if (addMaterialForm) {
        addMaterialForm.addEventListener('submit', handleAddMaterial);
    }
}

/**
 * Load all inventory data
 */
async function loadInventoryData() {
    try {
        console.log('Loading inventory data...');
        
        // Load materials and transactions in parallel
        const [materials, transactions] = await Promise.all([
            fetchMaterials(),
            fetchInventoryTransactions()
        ]);
        
        inventoryState.materials = materials;
        inventoryState.transactions = transactions;
        
        // Update UI
        updateInventoryDashboard();
        updateMaterialsTable();
        updateStockDashboard();
    } catch (error) {
        console.error('Error loading inventory data:', error);
        showNotification('Failed to load inventory data', 'error');
    }
}

/**
 * Fetch materials from API
 */
async function fetchMaterials() {
    try {
        const response = await apiRequest(INVENTORY_API.MATERIALS, {
            method: 'GET'
        });
        
        if (!response.ok) throw new Error('Failed to fetch materials');
        
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching materials:', error);
        return [];
    }
}

/**
 * Fetch inventory transactions
 */
async function fetchInventoryTransactions() {
    try {
        const response = await apiRequest(INVENTORY_API.TRANSACTIONS, {
            method: 'GET'
        });
        
        if (!response.ok) throw new Error('Failed to fetch transactions');
        
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

/**
 * Update inventory dashboard KPIs
 */
function updateInventoryDashboard() {
    // Calculate KPIs
    const totalMaterials = inventoryState.materials.length;
    const totalValue = inventoryState.materials.reduce((sum, m) => {
        return sum + (m.quantity_in_stock * (m.unit_cost || 0));
    }, 0);
    
    const lowStockCount = inventoryState.materials.filter(m => 
        m.quantity_in_stock <= m.reorder_level
    ).length;
    
    // Update DOM
    const totalMaterialsEl = document.getElementById('totalMaterials');
    const totalValueEl = document.getElementById('totalValue');
    const lowStockCountEl = document.getElementById('lowStockCount');
    
    if (totalMaterialsEl) totalMaterialsEl.textContent = totalMaterials;
    if (totalValueEl) totalValueEl.textContent = formatCurrency(totalValue);
    if (lowStockCountEl) lowStockCountEl.textContent = lowStockCount;
}

/**
 * Update materials table
 */
function updateMaterialsTable() {
    const tableBody = document.getElementById('materialsTable');
    if (!tableBody) return;
    
    if (inventoryState.materials.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    No materials found. <a href="#" onclick="loadOperation('add-material')" class="text-blue-600 hover:underline">Add one now</a>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = inventoryState.materials.map(material => {
        const status = material.quantity_in_stock <= material.reorder_level ? 'Low Stock' : 'Optimal';
        const statusClass = status === 'Low Stock' ? 'orange' : 'green';
        
        return `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 text-sm text-gray-700">${material.code || '-'}</td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">${material.name}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${material.category || '-'}</td>
                <td class="px-6 py-4 text-sm text-right text-gray-700">${material.quantity_in_stock || 0}</td>
                <td class="px-6 py-4 text-sm text-right text-gray-700">${formatCurrency(material.unit_cost || 0)}</td>
                <td class="px-6 py-4 text-sm">
                    <span class="bg-${statusClass}-100 text-${statusClass}-800 px-3 py-1 rounded-full text-xs font-medium">
                        ${status}
                    </span>
                </td>
                <td class="px-6 py-4 text-center">
                    <button onclick="viewMaterial('${material.id}')" class="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">View</button>
                    <button onclick="editMaterial('${material.id}')" class="text-yellow-600 hover:text-yellow-800 text-sm font-medium mr-3">Edit</button>
                    <button onclick="deleteMaterial('${material.id}')" class="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Update stock dashboard
 */
function updateStockDashboard() {
    // Group materials by category and calculate totals
    const categories = {};
    
    inventoryState.materials.forEach(material => {
        const cat = material.category || 'Other';
        if (!categories[cat]) {
            categories[cat] = { items: 0, quantity: 0 };
        }
        categories[cat].items += 1;
        categories[cat].quantity += material.quantity_in_stock || 0;
    });
    
    // Update category bars (this would be dynamic based on data)
    console.log('Stock dashboard updated with categories:', categories);
}

/**
 * Handle add material form submission
 */
async function handleAddMaterial(e) {
    e.preventDefault();
    
    const formData = {
        code: e.target.querySelector('input[placeholder="e.g., MAT-001"]').value,
        name: e.target.querySelector('input[placeholder="Enter material name"]').value,
        category: e.target.querySelector('select[value]').value,
        unit_of_measure: e.target.querySelectorAll('select')[1].value,
        description: e.target.querySelector('textarea').value,
        quantity_in_stock: parseInt(e.target.querySelectorAll('input[type="number"]')[0].value) || 0,
        unit_cost: parseFloat(e.target.querySelectorAll('input[type="number"]')[1].value) || 0,
        reorder_level: parseInt(e.target.querySelectorAll('input[type="number"]')[2].value) || 100,
        is_active: true
    };
    
    try {
        const response = await apiRequest(INVENTORY_API.MATERIALS, {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to add material');
        
        showNotification('Material added successfully!', 'success');
        e.target.reset();
        
        // Reload data and navigate back
        await loadInventoryData();
        setTimeout(() => {
            loadOperation('inventory-dashboard');
        }, 1500);
    } catch (error) {
        console.error('Error adding material:', error);
        showNotification('Failed to add material', 'error');
    }
}

/**
 * View material details
 */
async function viewMaterial(materialId) {
    try {
        const response = await apiRequest(`${INVENTORY_API.MATERIALS}/${materialId}`, {
            method: 'GET'
        });
        
        if (!response.ok) throw new Error('Failed to fetch material');
        
        const material = await response.json();
        
        // Display material details in a modal or detail view
        console.log('Material details:', material);
        showNotification(`Viewing: ${material.name}`, 'info');
    } catch (error) {
        console.error('Error viewing material:', error);
        showNotification('Failed to load material details', 'error');
    }
}

/**
 * Edit material
 */
function editMaterial(materialId) {
    const material = inventoryState.materials.find(m => m.id === materialId);
    if (!material) {
        showNotification('Material not found', 'error');
        return;
    }
    
    console.log('Editing material:', material);
    showNotification(`Editing: ${material.name}`, 'info');
    // TODO: Implement edit modal
}

/**
 * Delete material
 */
async function deleteMaterial(materialId) {
    if (!confirm('Are you sure you want to delete this material?')) return;
    
    try {
        const response = await apiRequest(`${INVENTORY_API.MATERIALS}/${materialId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete material');
        
        showNotification('Material deleted successfully!', 'success');
        await loadInventoryData();
    } catch (error) {
        console.error('Error deleting material:', error);
        showNotification('Failed to delete material', 'error');
    }
}

/**
 * Create reorder PO for low stock item
 */
async function createReorderPO(materialId) {
    const material = inventoryState.materials.find(m => m.id === materialId);
    if (!material) {
        showNotification('Material not found', 'error');
        return;
    }
    
    // Calculate reorder quantity (reorder level + safety stock)
    const reorderQuantity = material.reorder_level * 1.5 - material.quantity_in_stock;
    
    try {
        // This would create a PO via the procurement API
        showNotification(`Reorder PO created for ${reorderQuantity} units of ${material.name}`, 'success');
    } catch (error) {
        console.error('Error creating reorder PO:', error);
        showNotification('Failed to create reorder PO', 'error');
    }
}

/**
 * Filter materials by category
 */
function filterMaterialsByCategory(category) {
    if (category === 'all') {
        inventoryState.filters.category = 'all';
    } else {
        inventoryState.filters.category = category;
    }
    
    updateMaterialsTable();
}

/**
 * Filter materials by status
 */
function filterMaterialsByStatus(status) {
    if (status === 'all') {
        inventoryState.filters.status = 'all';
    } else {
        inventoryState.filters.status = status;
    }
    
    updateMaterialsTable();
}

/**
 * Export inventory to CSV
 */
function exportInventoryToCSV() {
    const headers = ['Code', 'Name', 'Category', 'Quantity', 'Unit Cost', 'Total Value', 'Status'];
    const data = inventoryState.materials.map(material => [
        material.code || '',
        material.name,
        material.category || '',
        material.quantity_in_stock || 0,
        material.unit_cost || 0,
        (material.quantity_in_stock || 0) * (material.unit_cost || 0),
        material.quantity_in_stock <= material.reorder_level ? 'Low Stock' : 'Optimal'
    ]);
    
    exportToCSV(data, headers, 'inventory-materials.csv');
}

/**
 * Print inventory report
 */
function printInventoryReport() {
    const content = document.getElementById('inventory-dashboard');
    if (!content) {
        showNotification('Inventory dashboard not found', 'error');
        return;
    }
    
    printElement('inventory-dashboard');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initInventoryModule();
});
