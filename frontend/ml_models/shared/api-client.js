/**
 * API Client for ML Models
 * Handles all HTTP requests to Flask backend
 */

class MLApiClient {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
        this.timeout = 30000;
        this.token = localStorage.getItem('authToken');
    }

    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    /**
     * Make HTTP request with error handling
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            method: options.method || 'GET',
            headers,
            timeout: options.timeout || this.timeout
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                throw new APIError(
                    `API Error: ${response.status}`,
                    response.status,
                    await response.json().catch(() => ({}))
                );
            }

            return await response.json();
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError(error.message, 500, { original: error });
        }
    }

    /**
     * GET request
     */
    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    /**
     * POST request
     */
    post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    }

    /**
     * PUT request
     */
    put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    }

    /**
     * DELETE request
     */
    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    // ========== Demand Forecasting Endpoints ==========

    /**
     * Get demand forecast for SKU
     */
    async getDemandForecast(skuId, dateRange) {
        return this.get(`/ml/demand-forecasting/forecast`, {
            params: { sku_id: skuId, ...dateRange }
        });
    }

    /**
     * Get available SKUs
     */
    async getSKUList() {
        return this.get(`/ml/demand-forecasting/skus`);
    }

    /**
     * Get forecast accuracy metrics
     */
    async getForecastMetrics(skuId) {
        return this.get(`/ml/demand-forecasting/metrics/${skuId}`);
    }

    /**
     * Trigger model retraining
     */
    async retainDemandModel(params = {}) {
        return this.post(`/ml/demand-forecasting/retrain`, params);
    }

    // ========== Inventory Optimization Endpoints ==========

    /**
     * Get inventory optimization recommendations
     */
    async getInventoryOptimization() {
        return this.get(`/ml/inventory-optimization/recommendations`);
    }

    /**
     * Get ABC analysis
     */
    async getABCAnalysis() {
        return this.get(`/ml/inventory-optimization/abc-analysis`);
    }

    /**
     * Get reorder points
     */
    async getReorderPoints() {
        return this.get(`/ml/inventory-optimization/reorder-points`);
    }

    /**
     * Get cost savings estimation
     */
    async getCostSavings() {
        return this.get(`/ml/inventory-optimization/cost-savings`);
    }

    // ========== Supplier Risk Scoring Endpoints ==========

    /**
     * Get all suppliers with risk scores
     */
    async getSupplierRisks() {
        return this.get(`/ml/supplier-risk/scores`);
    }

    /**
     * Get detailed supplier profile
     */
    async getSupplierProfile(supplierId) {
        return this.get(`/ml/supplier-risk/profile/${supplierId}`);
    }

    /**
     * Get supplier historical performance
     */
    async getSupplierHistory(supplierId, timeframe = '12m') {
        return this.get(`/ml/supplier-risk/history/${supplierId}`, {
            params: { timeframe }
        });
    }

    /**
     * Update risk threshold
     */
    async updateRiskThreshold(threshold) {
        return this.put(`/ml/supplier-risk/threshold`, { threshold });
    }

    // ========== Defect Detection Endpoints ==========

    /**
     * Upload and detect defects in image
     */
    async detectDefects(imageFile, lineId) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('line_id', lineId);

        return fetch(`${this.baseUrl}/ml/defect-detection/detect`, {
            method: 'POST',
            headers: {
                'Authorization': this.token ? `Bearer ${this.token}` : ''
            },
            body: formData
        }).then(r => r.json());
    }

    /**
     * Get defect trend data
     */
    async getDefectTrends(lineId, period = '7d') {
        return this.get(`/ml/defect-detection/trends`, {
            params: { line_id: lineId, period }
        });
    }

    /**
     * Get production line defects
     */
    async getLineDefects(lineId) {
        return this.get(`/ml/defect-detection/line/${lineId}`);
    }

    // ========== Quality Prediction Endpoints ==========

    /**
     * Get batch quality prediction
     */
    async predictBatchQuality(batchId) {
        return this.get(`/ml/quality-prediction/batch/${batchId}`);
    }

    /**
     * Get feature importance
     */
    async getFeatureImportance() {
        return this.get(`/ml/quality-prediction/feature-importance`);
    }

    /**
     * Get quality threshold
     */
    async getQualityThreshold() {
        return this.get(`/ml/quality-prediction/threshold`);
    }

    /**
     * Update quality threshold
     */
    async updateQualityThreshold(threshold) {
        return this.put(`/ml/quality-prediction/threshold`, { threshold });
    }
}

/**
 * Custom error class for API errors
 */
class APIError extends Error {
    constructor(message, statusCode, data) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.data = data;
    }
}

// Export for use in modules
window.MLApiClient = MLApiClient;
window.APIError = APIError;
