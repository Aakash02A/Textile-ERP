/**
 * Textile ERP - Shared Utilities
 * Common functions used across all modules
 */

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';
const API_TIMEOUT = 30000; // 30 seconds

/**
 * Make API request with error handling
 */
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                ...options.headers
            },
            timeout: API_TIMEOUT,
            ...options
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

/**
 * Format currency values
 */
function formatCurrency(value, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(value);
}

/**
 * Format date values
 */
function formatDate(date, format = 'short') {
    const options = format === 'short' 
        ? { year: 'numeric', month: 'short', day: 'numeric' }
        : { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    
    return new Date(date).toLocaleDateString('en-US', options);
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-medium z-50 animate-slide-in`;
    
    const bgColor = {
        'success': 'bg-green-500',
        'error': 'bg-red-500',
        'warning': 'bg-yellow-500',
        'info': 'bg-blue-500'
    }[type] || 'bg-blue-500';
    
    toast.classList.add(bgColor);
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, duration);
}

/**
 * Validate form input
 */
function validateInput(value, type) {
    const validators = {
        'email': (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        'phone': (v) => /^\d{10,}$/.test(v.replace(/\D/g, '')),
        'required': (v) => v && v.trim().length > 0,
        'number': (v) => !isNaN(v) && v !== '',
        'date': (v) => !isNaN(Date.parse(v))
    };
    
    return validators[type] ? validators[type](value) : true;
}

/**
 * Get authentication token
 */
function getAuthToken() {
    return localStorage.getItem('token');
}

/**
 * Set authentication token
 */
function setAuthToken(token) {
    localStorage.setItem('token', token);
}

/**
 * Clear authentication token
 */
function clearAuthToken() {
    localStorage.removeItem('token');
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return !!getAuthToken();
}

/**
 * Get user info from token
 */
function getUserInfo() {
    const token = getAuthToken();
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch {
        return null;
    }
}

/**
 * Debounce function
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

/**
 * Throttle function
 */
function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            func(...args);
            lastCall = now;
        }
    };
}

/**
 * Export data to CSV
 */
function exportToCSV(data, filename = 'export.csv') {
    const csv = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

/**
 * Print element
 */
function printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Print</title>');
    printWindow.document.write('<link rel="stylesheet" href="' + window.location.origin + '/assets/css/main.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write(element.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

export {
    apiRequest,
    formatCurrency,
    formatDate,
    showNotification,
    validateInput,
    getAuthToken,
    setAuthToken,
    clearAuthToken,
    isAuthenticated,
    getUserInfo,
    debounce,
    throttle,
    exportToCSV,
    printElement
};
