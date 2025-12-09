/**
 * Mock Backend Service
 * Simulates real-time ERP backend for development/testing
 * Provides realistic data with timestamps and proper structure
 */

class MockBackendService {
    constructor() {
        this.data = {
            purchaseOrders: this.generatePurchaseOrders(),
            suppliers: this.generateSuppliers(),
            materials: this.generateMaterials(),
            workOrders: this.generateWorkOrders(),
            customers: this.generateCustomers(),
            salesOrders: this.generateSalesOrders(),
            qcLogs: this.generateQCLogs()
        };
        
        this.setupSimulatedUpdates();
    }

    // --- Data Generators ---
    generatePurchaseOrders() {
        return [
            {
                id: 'PO-2024-001',
                supplierId: 'SUP-001',
                supplierName: 'Textile Supplier Ltd',
                status: 'Approved',
                amount: 15000,
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                items: 3,
                dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'PO-2024-002',
                supplierId: 'SUP-002',
                supplierName: 'Fabric Wholesale Inc',
                status: 'Draft',
                amount: 8500,
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                items: 2,
                dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'PO-2024-003',
                supplierId: 'SUP-003',
                supplierName: 'Premium Fabrics Co',
                status: 'Received',
                amount: 22000,
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                items: 5,
                dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
    }

    generateSuppliers() {
        return [
            { id: 'SUP-001', name: 'Textile Supplier Ltd', rating: 4.5, status: 'Active' },
            { id: 'SUP-002', name: 'Fabric Wholesale Inc', rating: 4.0, status: 'Active' },
            { id: 'SUP-003', name: 'Premium Fabrics Co', rating: 4.8, status: 'Active' },
            { id: 'SUP-004', name: 'Global Textiles', rating: 3.5, status: 'Inactive' },
            { id: 'SUP-005', name: 'Eco Fabrics Ltd', rating: 4.2, status: 'Active' }
        ];
    }

    generateMaterials() {
        return [
            { id: 'MAT-001', code: 'MAT-001', name: 'Premium Cotton Fabric', quantity: 500, unit: 'm', price: 12, category: 'Fabric' },
            { id: 'MAT-002', code: 'MAT-002', name: 'Polyester Blend', quantity: 250, unit: 'm', price: 8, category: 'Fabric' },
            { id: 'MAT-003', code: 'MAT-003', name: 'Silk Thread', quantity: 1000, unit: 'spool', price: 5, category: 'Thread' },
            { id: 'MAT-004', code: 'MAT-004', name: 'Denim Fabric', quantity: 150, unit: 'm', price: 15, category: 'Fabric' },
            { id: 'MAT-005', code: 'MAT-005', name: 'Button - Medium', quantity: 5000, unit: 'piece', price: 0.5, category: 'Accessories' }
        ];
    }

    generateWorkOrders() {
        return [
            {
                id: 'WO-2024-001',
                productId: 'PROD-001',
                productName: 'Cotton T-Shirt - Size M',
                quantity: 5000,
                status: 'In Progress',
                progress: 65,
                startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                priority: 'High'
            },
            {
                id: 'WO-2024-002',
                productId: 'PROD-002',
                productName: 'Denim Jeans - Size 32',
                quantity: 2500,
                status: 'Pending',
                progress: 0,
                startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
                priority: 'Medium'
            },
            {
                id: 'WO-2024-003',
                productId: 'PROD-003',
                productName: 'Polyester Jacket - Size L',
                quantity: 1000,
                status: 'Completed',
                progress: 100,
                startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                priority: 'Low'
            }
        ];
    }

    generateCustomers() {
        return [
            {
                id: 'CUST-001',
                name: 'ABC Retail Store',
                email: 'contact@abcretail.com',
                phone: '+1-555-0101',
                city: 'New York',
                orders: 5,
                totalRevenue: 125000
            },
            {
                id: 'CUST-002',
                name: 'XYZ Fashion Boutique',
                email: 'hello@xyzfashion.com',
                phone: '+1-555-0102',
                city: 'Los Angeles',
                orders: 3,
                totalRevenue: 75000
            },
            {
                id: 'CUST-003',
                name: 'Global Apparel Co',
                email: 'info@globalapparel.com',
                phone: '+1-555-0103',
                city: 'Chicago',
                orders: 12,
                totalRevenue: 450000
            }
        ];
    }

    generateSalesOrders() {
        return [
            {
                id: 'SO-2024-001',
                customerId: 'CUST-001',
                customerName: 'ABC Retail Store',
                amount: 25000,
                status: 'Delivered',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                items: 2
            },
            {
                id: 'SO-2024-002',
                customerId: 'CUST-002',
                customerName: 'XYZ Fashion Boutique',
                amount: 18500,
                status: 'Processing',
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                items: 1
            },
            {
                id: 'SO-2024-003',
                customerId: 'CUST-003',
                customerName: 'Global Apparel Co',
                amount: 45000,
                status: 'Pending',
                date: new Date(Date.now()).toISOString(),
                items: 5
            }
        ];
    }

    generateQCLogs() {
        return [
            {
                id: 'QC-2024-001',
                workOrderId: 'WO-2024-001',
                defectsFound: 5,
                defectRate: 0.1,
                passed: true,
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                inspector: 'John Smith'
            },
            {
                id: 'QC-2024-002',
                workOrderId: 'WO-2024-002',
                defectsFound: 0,
                defectRate: 0,
                passed: true,
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                inspector: 'Maria Garcia'
            }
        ];
    }

    // --- Simulated Real-Time Updates ---
    setupSimulatedUpdates() {
        // Simulate real-time data changes
        setInterval(() => {
            // Update work order progress
            const wo = this.data.workOrders.find(w => w.status === 'In Progress');
            if (wo && wo.progress < 100) {
                wo.progress += Math.random() * 10;
                if (wo.progress > 100) wo.progress = 100;
            }

            // Random status changes
            if (Math.random() > 0.95) {
                const rand = Math.random();
                if (rand > 0.7) {
                    const po = this.data.purchaseOrders[Math.floor(Math.random() * this.data.purchaseOrders.length)];
                    const statuses = ['Draft', 'Approved', 'Received'];
                    po.status = statuses[Math.floor(Math.random() * statuses.length)];
                }
            }
        }, 5000);
    }

    // --- API Methods ---
    async getPurchaseOrders(filters = {}) {
        return new Promise(resolve => {
            setTimeout(() => {
                let result = [...this.data.purchaseOrders];
                
                if (filters.status) {
                    result = result.filter(po => po.status === filters.status);
                }
                
                resolve({ success: true, data: result, timestamp: new Date().toISOString() });
            }, 300);
        });
    }

    async createPurchaseOrder(payload) {
        return new Promise(resolve => {
            setTimeout(() => {
                const newPO = {
                    id: `PO-2024-${this.data.purchaseOrders.length + 1}`,
                    ...payload,
                    date: new Date().toISOString()
                };
                this.data.purchaseOrders.push(newPO);
                resolve({ success: true, data: newPO, message: 'Purchase Order created successfully' });
            }, 500);
        });
    }

    async getInventory(filters = {}) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true, data: this.data.materials, timestamp: new Date().toISOString() });
            }, 300);
        });
    }

    async getWorkOrders(filters = {}) {
        return new Promise(resolve => {
            setTimeout(() => {
                let result = [...this.data.workOrders];
                
                if (filters.status) {
                    result = result.filter(wo => wo.status === filters.status);
                }
                
                resolve({ success: true, data: result, timestamp: new Date().toISOString() });
            }, 300);
        });
    }

    async createWorkOrder(payload) {
        return new Promise(resolve => {
            setTimeout(() => {
                const newWO = {
                    id: `WO-2024-${this.data.workOrders.length + 1}`,
                    ...payload,
                    progress: 0,
                    status: 'Pending',
                    startDate: new Date().toISOString()
                };
                this.data.workOrders.push(newWO);
                resolve({ success: true, data: newWO, message: 'Work Order created successfully' });
            }, 500);
        });
    }

    async getCustomers(filters = {}) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true, data: this.data.customers, timestamp: new Date().toISOString() });
            }, 300);
        });
    }

    async createCustomer(payload) {
        return new Promise(resolve => {
            setTimeout(() => {
                const newCustomer = {
                    id: `CUST-${this.data.customers.length + 1}`,
                    ...payload,
                    orders: 0,
                    totalRevenue: 0
                };
                this.data.customers.push(newCustomer);
                resolve({ success: true, data: newCustomer, message: 'Customer created successfully' });
            }, 500);
        });
    }

    async getSalesOrders(filters = {}) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true, data: this.data.salesOrders, timestamp: new Date().toISOString() });
            }, 300);
        });
    }

    async getQCLogs(filters = {}) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true, data: this.data.qcLogs, timestamp: new Date().toISOString() });
            }, 300);
        });
    }

    async logQC(payload) {
        return new Promise(resolve => {
            setTimeout(() => {
                const newQC = {
                    id: `QC-2024-${this.data.qcLogs.length + 1}`,
                    ...payload,
                    timestamp: new Date().toISOString()
                };
                this.data.qcLogs.push(newQC);
                resolve({ success: true, data: newQC, message: 'QC log created successfully' });
            }, 500);
        });
    }
}

// Create global instance
const mockBackend = new MockBackendService();
