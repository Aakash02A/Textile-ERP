/**
 * ERP Utilities - Shared Components
 * Reusable functions for notifications, validation, modals, and state management
 */

// ============================================
// NOTIFICATION SYSTEM (Toast Messages)
// ============================================

class NotificationManager {
    constructor() {
        this.container = null;
        this.initContainer();
    }

    initContainer() {
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(container);
            this.container = container;
        } else {
            this.container = document.getElementById('notification-container');
        }
    }

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        const bgColor = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        }[type] || '#3b82f6';

        notification.style.cssText = `
            background-color: ${bgColor};
            color: white;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            animation: slideIn 0.3s ease-out;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
        `;
        notification.textContent = message;
        this.container.appendChild(notification);

        if (duration > 0) {
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }

        return notification;
    }

    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
}

// ============================================
// VALIDATION SYSTEM
// ============================================

class FormValidator {
    static rules = {
        required: (value) => value && value.trim().length > 0 ? null : 'This field is required',
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Invalid email address',
        phone: (value) => /^[\d\s\-\(\)\+]+$/.test(value) && value.replace(/\D/g, '').length >= 10 ? null : 'Invalid phone number',
        number: (value) => !isNaN(value) && value !== '' ? null : 'Must be a number',
        positive: (value) => !isNaN(value) && value > 0 ? null : 'Must be greater than 0',
        minLength: (min) => (value) => value.length >= min ? null : `Minimum ${min} characters required`,
        maxLength: (max) => (value) => value.length <= max ? null : `Maximum ${max} characters allowed`,
        min: (min) => (value) => parseFloat(value) >= min ? null : `Must be at least ${min}`,
        max: (max) => (value) => parseFloat(value) <= max ? null : `Must be at most ${max}`,
        date: (value) => !isNaN(Date.parse(value)) ? null : 'Invalid date',
        dateAfter: (minDate) => (value) => new Date(value) > new Date(minDate) ? null : 'Date must be after ' + minDate,
        dateBefore: (maxDate) => (value) => new Date(value) < new Date(maxDate) ? null : 'Date must be before ' + maxDate,
        match: (fieldName) => (value, formData) => value === formData[fieldName] ? null : `Does not match ${fieldName}`
    };

    static validate(formData, schema) {
        const errors = {};

        Object.keys(schema).forEach(fieldName => {
            const fieldRules = schema[fieldName];
            const value = formData[fieldName] || '';

            if (Array.isArray(fieldRules)) {
                for (const rule of fieldRules) {
                    let validator = rule;
                    let errorMessage = null;

                    if (typeof rule === 'function') {
                        errorMessage = rule(value, formData);
                    } else if (typeof rule === 'string' && this.rules[rule]) {
                        errorMessage = this.rules[rule](value);
                    } else if (typeof rule === 'object' && rule.type && this.rules[rule.type]) {
                        const ruleFn = this.rules[rule.type];
                        if (typeof ruleFn === 'function' && rule.value !== undefined) {
                            errorMessage = ruleFn(rule.value)(value, formData);
                        } else {
                            errorMessage = ruleFn(value);
                        }
                    }

                    if (errorMessage) {
                        errors[fieldName] = errorMessage;
                        break;
                    }
                }
            }
        });

        return errors;
    }

    static displayErrors(form, errors) {
        // Clear previous errors
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('input, textarea, select').forEach(el => el.classList.remove('border-red-500'));

        // Display new errors
        Object.keys(errors).forEach(fieldName => {
            const input = form.querySelector(`[name="${fieldName}"]`);
            if (input) {
                input.classList.add('border-red-500');
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message text-red-500 text-sm mt-1';
                errorDiv.textContent = errors[fieldName];
                input.parentNode.insertBefore(errorDiv, input.nextSibling);
            }
        });

        return Object.keys(errors).length === 0;
    }

    static clearErrors(form) {
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('input, textarea, select').forEach(el => el.classList.remove('border-red-500'));
    }
}

// ============================================
// MODAL/DIALOG SYSTEM
// ============================================

class ModalManager {
    constructor() {
        this.modals = new Map();
    }

    create(id, options = {}) {
        const {
            title = 'Modal',
            content = '',
            buttons = [],
            onClose = null,
            width = 'max-w-md'
        } = options;

        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = `modal-backdrop fixed inset-0 bg-black bg-opacity-50 z-40 hidden`;
        backdrop.id = `${id}-backdrop`;

        // Create modal
        const modal = document.createElement('div');
        modal.className = `modal fixed inset-0 z-50 hidden flex items-center justify-center`;
        modal.id = id;

        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl ${width}">
                <div class="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
                    <button class="text-gray-400 hover:text-gray-600" onclick="modalManager.close('${id}')">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="p-6 modal-content">
                    ${content}
                </div>
                <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
                    ${buttons.map((btn, i) => `
                        <button 
                            class="px-4 py-2 rounded-lg font-medium transition-colors ${
                                btn.type === 'primary' 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                            }"
                            onclick="${btn.onclick || ''}"
                        >
                            ${btn.label}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);
        document.body.appendChild(modal);

        this.modals.set(id, { modal, backdrop, onClose });

        // Close on backdrop click
        backdrop.addEventListener('click', () => this.close(id));

        return { modal, backdrop };
    }

    open(id) {
        const item = this.modals.get(id);
        if (item) {
            item.backdrop.classList.remove('hidden');
            item.modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    close(id) {
        const item = this.modals.get(id);
        if (item) {
            item.backdrop.classList.add('hidden');
            item.modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            if (item.onClose) item.onClose();
        }
    }

    confirm(title, message, onConfirm, onCancel = null) {
        const id = 'confirm-modal-' + Date.now();
        this.create(id, {
            title,
            content: `<p class="text-gray-600">${message}</p>`,
            buttons: [
                { label: 'Cancel', onclick: `modalManager.close('${id}')` },
                { 
                    label: 'Confirm', 
                    type: 'primary',
                    onclick: `(${onConfirm.toString()})(); modalManager.close('${id}')`
                }
            ],
            onClose: onCancel
        });
        this.open(id);
    }

    alert(title, message) {
        const id = 'alert-modal-' + Date.now();
        this.create(id, {
            title,
            content: `<p class="text-gray-600">${message}</p>`,
            buttons: [
                { label: 'OK', type: 'primary', onclick: `modalManager.close('${id}')` }
            ]
        });
        this.open(id);
    }
}

// ============================================
// LOADING STATE MANAGER
// ============================================

class LoadingManager {
    static show(element, message = 'Loading...') {
        element.disabled = true;
        element.classList.add('opacity-50', 'cursor-not-allowed');
        const originalContent = element.innerHTML;
        element.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${message}`;
        element.dataset.originalContent = originalContent;
    }

    static hide(element) {
        element.disabled = false;
        element.classList.remove('opacity-50', 'cursor-not-allowed');
        if (element.dataset.originalContent) {
            element.innerHTML = element.dataset.originalContent;
        }
    }

    static showOverlay(message = 'Loading...') {
        let overlay = document.getElementById('loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
            overlay.innerHTML = `
                <div class="bg-white rounded-lg p-8 text-center">
                    <i class="fas fa-spinner fa-spin text-3xl text-blue-600 mb-4"></i>
                    <p class="text-gray-700 font-medium">${message}</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        overlay.classList.remove('hidden');
    }

    static hideOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.add('hidden');
    }
}

// ============================================
// STATE MANAGER (Simple State Container)
// ============================================

class StateManager {
    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = [];
    }

    setState(updates) {
        this.state = { ...this.state, ...updates };
        this.notifyListeners();
    }

    getState() {
        return { ...this.state };
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const Utils = {
    /**
     * Format currency values
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    },

    /**
     * Format date to readable format
     */
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    /**
     * Format date to ISO format
     */
    toISODate(date) {
        return new Date(date).toISOString().split('T')[0];
    },

    /**
     * Generate unique ID
     */
    generateId(prefix = '') {
        return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Get form data as object
     */
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    },

    /**
     * Set form data from object
     */
    setFormData(form, data) {
        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = data[key];
            }
        });
    },

    /**
     * Deep clone object
     */
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Check if value is empty
     */
    isEmpty(value) {
        return !value || (typeof value === 'string' && value.trim() === '') || 
               (Array.isArray(value) && value.length === 0) ||
               (typeof value === 'object' && Object.keys(value).length === 0);
    }
};

// ============================================
// INITIALIZE GLOBAL INSTANCES
// ============================================

const notify = new NotificationManager();
const validator = FormValidator;
const modalManager = new ModalManager();
const loadingManager = LoadingManager;

// Add CSS animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
