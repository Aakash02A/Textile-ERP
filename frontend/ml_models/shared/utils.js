/**
 * Utility Functions for ML Models
 */

const Utils = {
    /**
     * Format date to readable format
     */
    formatDate(date, format = 'short') {
        const d = new Date(date);
        if (format === 'short') {
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
        }
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    },

    /**
     * Format number with commas
     */
    formatNumber(num, decimals = 0) {
        return num.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },

    /**
     * Format currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    /**
     * Format percentage
     */
    formatPercentage(value, decimals = 1) {
        return (value * 100).toFixed(decimals) + '%';
    },

    /**
     * Get color for risk level
     */
    getRiskColor(score) {
        if (score < 30) return '#10b981'; // Green - Low risk
        if (score < 60) return '#f59e0b'; // Amber - Medium risk
        return '#ef4444'; // Red - High risk
    },

    /**
     * Get color for quality score
     */
    getQualityColor(score) {
        if (score >= 90) return '#10b981'; // Green - Excellent
        if (score >= 80) return '#3b82f6'; // Blue - Good
        if (score >= 70) return '#f59e0b'; // Amber - Fair
        return '#ef4444'; // Red - Poor
    },

    /**
     * Debounce function
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Throttle function
     */
    throttle(func, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func.apply(this, args);
            }
        };
    },

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        const container = document.getElementById('notifications') || document.body;
        container.appendChild(notification);

        const close = () => notification.remove();
        notification.querySelector('.notification-close').addEventListener('click', close);
        
        if (duration > 0) {
            setTimeout(close, duration);
        }

        return notification;
    },

    /**
     * Export data to CSV
     */
    exportToCSV(data, filename = 'export.csv') {
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    },

    /**
     * Convert array to CSV
     */
    convertToCSV(data) {
        if (!Array.isArray(data) || data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const rows = data.map(obj => headers.map(h => `"${obj[h]}"`).join(','));
        
        return [headers.join(','), ...rows].join('\n');
    },

    /**
     * Export data to JSON
     */
    exportToJSON(data, filename = 'export.json') {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    },

    /**
     * Get date range
     */
    getDateRange(type = '30d') {
        const end = new Date();
        const start = new Date();

        const ranges = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '1y': 365,
            '3m': 90,
            '6m': 180,
            '12m': 365
        };

        const days = ranges[type] || 30;
        start.setDate(start.getDate() - days);

        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0],
            days
        };
    },

    /**
     * Get status badge class
     */
    getStatusClass(status) {
        const classes = {
            'low_risk': 'badge-success',
            'stable': 'badge-info',
            'warning': 'badge-warning',
            'critical': 'badge-danger',
            'pass': 'badge-success',
            'fail': 'badge-danger',
            'review': 'badge-warning'
        };
        return classes[status] || 'badge-secondary';
    }
};

// Export
window.Utils = Utils;
