/**
 * Real-Time ERP Data Manager
 * Handles all data operations, synchronization, and state management
 * Supports both local storage and backend API integration
 */

class ERPDataManager {
    constructor(apiBaseUrl = 'http://localhost:5000/api') {
        this.apiBaseUrl = apiBaseUrl;
        this.isOnline = true;
        this.dataCache = new Map();
        this.listeners = new Map();
        this.syncQueue = [];
        this.retryAttempts = 3;
        this.retryDelay = 1000; // ms
        
        this.initializeOnlineDetection();
        this.loadFromLocalStorage();
    }

    // --- Initialization ---
    initializeOnlineDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('[ERP] Online - syncing queued operations');
            this.processSyncQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('[ERP] Offline - operations will be queued');
        });
    }

    loadFromLocalStorage() {
        try {
            const cached = localStorage.getItem('erp_data_cache');
            if (cached) {
                this.dataCache = new Map(JSON.parse(cached));
            }
        } catch (error) {
            console.error('[ERP] Error loading cache:', error);
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('erp_data_cache', JSON.stringify(Array.from(this.dataCache)));
        } catch (error) {
            console.error('[ERP] Error saving cache:', error);
        }
    }

    // --- Data Retrieval ---
    async getData(endpoint, useCache = true) {
        const cacheKey = `GET:${endpoint}`;
        
        // Return cached data if available and cache enabled
        if (useCache && this.dataCache.has(cacheKey)) {
            return this.dataCache.get(cacheKey);
        }

        // If offline, return cached data or null
        if (!this.isOnline) {
            if (this.dataCache.has(cacheKey)) {
                console.warn(`[ERP] Offline - returning cached data for ${endpoint}`);
                return this.dataCache.get(cacheKey);
            }
            throw new Error('Offline and no cached data available');
        }

        try {
            const response = await this.fetchWithRetry(`${this.apiBaseUrl}${endpoint}`);
            const data = await response.json();
            
            // Cache the result
            this.dataCache.set(cacheKey, data);
            this.saveToLocalStorage();
            this.notifyListeners(endpoint, data);
            
            return data;
        } catch (error) {
            console.error(`[ERP] Error fetching ${endpoint}:`, error);
            
            // Try to return cached data
            if (this.dataCache.has(cacheKey)) {
                return this.dataCache.get(cacheKey);
            }
            throw error;
        }
    }

    // --- Data Mutation ---
    async createData(endpoint, payload) {
        const operation = { 
            type: 'POST', 
            endpoint, 
            payload, 
            timestamp: Date.now() 
        };

        if (!this.isOnline) {
            this.syncQueue.push(operation);
            console.log(`[ERP] Operation queued (offline): ${endpoint}`);
            return { queued: true, id: Date.now() };
        }

        try {
            const response = await this.fetchWithRetry(
                `${this.apiBaseUrl}${endpoint}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }
            );

            const result = await response.json();
            this.invalidateCache(endpoint);
            this.notifyListeners(endpoint, result);
            
            return result;
        } catch (error) {
            console.error(`[ERP] Error creating data at ${endpoint}:`, error);
            this.syncQueue.push(operation);
            throw error;
        }
    }

    async updateData(endpoint, payload) {
        const operation = { 
            type: 'PUT', 
            endpoint, 
            payload, 
            timestamp: Date.now() 
        };

        if (!this.isOnline) {
            this.syncQueue.push(operation);
            console.log(`[ERP] Operation queued (offline): ${endpoint}`);
            return { queued: true, id: Date.now() };
        }

        try {
            const response = await this.fetchWithRetry(
                `${this.apiBaseUrl}${endpoint}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }
            );

            const result = await response.json();
            this.invalidateCache(endpoint);
            this.notifyListeners(endpoint, result);
            
            return result;
        } catch (error) {
            console.error(`[ERP] Error updating data at ${endpoint}:`, error);
            this.syncQueue.push(operation);
            throw error;
        }
    }

    async deleteData(endpoint) {
        const operation = { 
            type: 'DELETE', 
            endpoint, 
            timestamp: Date.now() 
        };

        if (!this.isOnline) {
            this.syncQueue.push(operation);
            console.log(`[ERP] Operation queued (offline): ${endpoint}`);
            return { queued: true, id: Date.now() };
        }

        try {
            const response = await this.fetchWithRetry(
                `${this.apiBaseUrl}${endpoint}`,
                { method: 'DELETE' }
            );

            const result = await response.json();
            this.invalidateCache(endpoint);
            this.notifyListeners(endpoint, result);
            
            return result;
        } catch (error) {
            console.error(`[ERP] Error deleting data at ${endpoint}:`, error);
            this.syncQueue.push(operation);
            throw error;
        }
    }

    // --- Cache Management ---
    invalidateCache(endpoint) {
        // Invalidate related cache entries
        for (const key of this.dataCache.keys()) {
            if (key.includes(endpoint) || endpoint.includes(key.split(':')[1])) {
                this.dataCache.delete(key);
            }
        }
        this.saveToLocalStorage();
    }

    clearCache() {
        this.dataCache.clear();
        this.saveToLocalStorage();
    }

    // --- Sync Queue ---
    async processSyncQueue() {
        if (this.syncQueue.length === 0) return;

        console.log(`[ERP] Processing ${this.syncQueue.length} queued operations`);
        const queue = [...this.syncQueue];
        this.syncQueue = [];

        for (const operation of queue) {
            try {
                const { type, endpoint, payload } = operation;
                
                if (type === 'POST') {
                    await this.createData(endpoint, payload);
                } else if (type === 'PUT') {
                    await this.updateData(endpoint, payload);
                } else if (type === 'DELETE') {
                    await this.deleteData(endpoint);
                }
            } catch (error) {
                console.error('[ERP] Sync error:', error);
                // Re-queue failed operation
                this.syncQueue.push(operation);
            }
        }

        if (this.syncQueue.length > 0) {
            console.warn(`[ERP] ${this.syncQueue.length} operations still pending`);
        } else {
            console.log('[ERP] All queued operations synced');
        }
    }

    // --- Fetch with Retry ---
    async fetchWithRetry(url, options = {}, attempt = 0) {
        try {
            const response = await fetch(url, { ...options, timeout: 5000 });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
        } catch (error) {
            if (attempt < this.retryAttempts) {
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.fetchWithRetry(url, options, attempt + 1);
            }
            throw error;
        }
    }

    // --- Event Listeners ---
    subscribe(endpoint, callback) {
        if (!this.listeners.has(endpoint)) {
            this.listeners.set(endpoint, []);
        }
        this.listeners.get(endpoint).push(callback);
        
        return () => {
            const callbacks = this.listeners.get(endpoint);
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        };
    }

    notifyListeners(endpoint, data) {
        if (this.listeners.has(endpoint)) {
            this.listeners.get(endpoint).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('[ERP] Listener error:', error);
                }
            });
        }
    }

    // --- Data Methods (High-level API) ---
    async fetchPurchaseOrders(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            return await this.getData(`/procurement/purchase-orders?${params}`);
        } catch (error) {
            console.error('Error fetching purchase orders:', error);
            return [];
        }
    }

    async createPurchaseOrder(poData) {
        return await this.createData('/procurement/purchase-orders', poData);
    }

    async fetchInventory(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            return await this.getData(`/inventory/materials?${params}`);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            return [];
        }
    }

    async fetchWorkOrders(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            return await this.getData(`/production/work-orders?${params}`);
        } catch (error) {
            console.error('Error fetching work orders:', error);
            return [];
        }
    }

    async createWorkOrder(woData) {
        return await this.createData('/production/work-orders', woData);
    }

    async fetchCustomers(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            return await this.getData(`/sales/customers?${params}`);
        } catch (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
    }

    async createCustomer(customerData) {
        return await this.createData('/sales/customers', customerData);
    }

    async fetchSalesOrders(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            return await this.getData(`/sales/orders?${params}`);
        } catch (error) {
            console.error('Error fetching sales orders:', error);
            return [];
        }
    }

    async fetchQCData(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            return await this.getData(`/quality/logs?${params}`);
        } catch (error) {
            console.error('Error fetching QC data:', error);
            return [];
        }
    }

    async logQCForm(qcData) {
        return await this.createData('/quality/logs', qcData);
    }

    async fetchReports(reportType, filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            return await this.getData(`/reports/${reportType}?${params}`);
        } catch (error) {
            console.error(`Error fetching ${reportType} report:`, error);
            return null;
        }
    }

    // --- Status & Health ---
    getStatus() {
        return {
            isOnline: this.isOnline,
            cacheSize: this.dataCache.size,
            queuedOperations: this.syncQueue.length,
            timestamp: new Date().toISOString()
        };
    }
}

// Create global instance
const erpManager = new ERPDataManager();
