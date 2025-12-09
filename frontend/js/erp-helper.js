/**
 * Real-Time ERP Helper
 * Provides easy-to-use methods for common ERP operations
 * Auto-handles errors, loading states, and data updates
 */

class ERPHelper {
    static async loadPurchaseOrders(filterStatus = null) {
        try {
            const filters = filterStatus ? { status: filterStatus } : {};
            const response = await mockBackend.getPurchaseOrders(filters);
            return response.data || [];
        } catch (error) {
            console.error('Error loading purchase orders:', error);
            return [];
        }
    }

    static async createPurchaseOrder(formData) {
        try {
            const payload = {
                supplierId: formData.supplier,
                supplierName: formData.supplierName,
                amount: formData.grandTotal,
                status: 'Draft',
                items: formData.items || 1,
                dueDate: formData.deliveryDate
            };
            
            const response = await mockBackend.createPurchaseOrder(payload);
            if (response.success) {
                console.log('✓ Purchase Order created:', response.data.id);
                return response.data;
            }
            throw new Error(response.message || 'Failed to create PO');
        } catch (error) {
            console.error('Error creating purchase order:', error);
            throw error;
        }
    }

    static async loadInventory() {
        try {
            const response = await mockBackend.getInventory();
            return response.data || [];
        } catch (error) {
            console.error('Error loading inventory:', error);
            return [];
        }
    }

    static async loadWorkOrders(filterStatus = null) {
        try {
            const filters = filterStatus ? { status: filterStatus } : {};
            const response = await mockBackend.getWorkOrders(filters);
            return response.data || [];
        } catch (error) {
            console.error('Error loading work orders:', error);
            return [];
        }
    }

    static async createWorkOrder(formData) {
        try {
            const payload = {
                productId: formData.product,
                productName: formData.productName,
                quantity: parseInt(formData.quantity),
                dueDate: formData.completionDate,
                priority: formData.priority || 'Medium',
                status: 'Pending'
            };
            
            const response = await mockBackend.createWorkOrder(payload);
            if (response.success) {
                console.log('✓ Work Order created:', response.data.id);
                return response.data;
            }
            throw new Error(response.message || 'Failed to create WO');
        } catch (error) {
            console.error('Error creating work order:', error);
            throw error;
        }
    }

    static async loadCustomers() {
        try {
            const response = await mockBackend.getCustomers();
            return response.data || [];
        } catch (error) {
            console.error('Error loading customers:', error);
            return [];
        }
    }

    static async createCustomer(formData) {
        try {
            const payload = {
                name: formData.customerName,
                email: formData.email,
                phone: formData.phone,
                city: formData.billingCity,
                status: 'Active'
            };
            
            const response = await mockBackend.createCustomer(payload);
            if (response.success) {
                console.log('✓ Customer created:', response.data.id);
                return response.data;
            }
            throw new Error(response.message || 'Failed to create customer');
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    }

    static async loadSalesOrders() {
        try {
            const response = await mockBackend.getSalesOrders();
            return response.data || [];
        } catch (error) {
            console.error('Error loading sales orders:', error);
            return [];
        }
    }

    static async loadQCLogs() {
        try {
            const response = await mockBackend.getQCLogs();
            return response.data || [];
        } catch (error) {
            console.error('Error loading QC logs:', error);
            return [];
        }
    }

    static async logQCForm(formData) {
        try {
            const payload = {
                workOrderId: formData.workOrderId,
                defectsFound: parseInt(formData.defectsFound) || 0,
                defectRate: (parseInt(formData.defectsFound) / parseInt(formData.totalInspected)) || 0,
                passed: parseInt(formData.defectsFound) === 0,
                inspector: formData.inspector || 'System'
            };
            
            const response = await mockBackend.logQC(payload);
            if (response.success) {
                console.log('✓ QC log created:', response.data.id);
                return response.data;
            }
            throw new Error(response.message || 'Failed to log QC');
        } catch (error) {
            console.error('Error logging QC:', error);
            throw error;
        }
    }

    // --- Utility Methods ---
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static getStatusColor(status) {
        const colors = {
            'Draft': '#fbbf24',
            'Approved': '#10b981',
            'Received': '#8b5cf6',
            'Completed': '#10b981',
            'In Progress': '#3b82f6',
            'Pending': '#f59e0b',
            'Processing': '#3b82f6',
            'Delivered': '#10b981',
            'Active': '#10b981',
            'Inactive': '#ef4444'
        };
        return colors[status] || '#6b7280';
    }

    static showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50`;
        
        const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        notification.className = `${bgColor} fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    static showLoading(element, message = 'Loading...') {
        if (!element) return;
        element.innerHTML = `<div class="flex items-center justify-center p-4"><i class="fas fa-spinner fa-spin mr-2"></i> ${message}</div>`;
    }

    static showError(element, message = 'An error occurred') {
        if (!element) return;
        element.innerHTML = `<div class="p-4 bg-red-100 border border-red-400 text-red-700 rounded"><i class="fas fa-exclamation-circle mr-2"></i> ${message}</div>`;
    }
}
