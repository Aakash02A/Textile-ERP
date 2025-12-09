## Quick Reference: Using the ERP Utilities

All new pages automatically have access to:
- `notify` - Notification system
- `validator` - Form validator
- `modalManager` - Dialog management
- `loadingManager` - Loading states
- `Utils` - Utility functions
- `erp` - ERPHelper for data operations

---

## NOTIFICATIONS

### Success Notification
```javascript
notify.success('Purchase order created successfully!');
notify.success('Customer added', 2000); // Auto-dismiss after 2 seconds
```

### Error Notification
```javascript
notify.error('Failed to create PO: Invalid supplier');
```

### Warning
```javascript
notify.warning('No items found in search');
```

### Info
```javascript
notify.info('Loading data...');
```

---

## FORM VALIDATION

### Define Validation Schema
```javascript
const schema = {
    email: ['required', 'email'],
    phone: ['required', 'phone'],
    quantity: ['required', 'positive'],
    password: ['required', { type: 'minLength', value: 8 }],
    confirmPassword: [{ type: 'match', value: 'password' }],
    dueDate: ['required', 'date', { type: 'dateAfter', value: new Date().toISOString() }]
};
```

### Validate Form
```javascript
const formData = Utils.getFormData(form);
const errors = validator.validate(formData, schema);

if (!validator.displayErrors(form, errors)) {
    // Errors found - form displays them
    return;
}

// Validation passed - proceed with submission
```

### Clear Errors
```javascript
validator.clearErrors(form);
```

---

## LOADING STATES

### Button Loading
```javascript
const submitBtn = form.querySelector('button[type="submit"]');

LoadingManager.show(submitBtn, 'Creating order...');
try {
    const result = await erp.createPurchaseOrder(data);
    notify.success('Created: ' + result.id);
} finally {
    LoadingManager.hide(submitBtn);
}
```

### Page Overlay Loading
```javascript
LoadingManager.showOverlay('Loading purchase orders...');
try {
    const data = await erp.loadPurchaseOrders();
    renderTable(data);
} catch (error) {
    notify.error(error.message);
} finally {
    LoadingManager.hideOverlay();
}
```

---

## MODALS

### Simple Alert
```javascript
modalManager.alert('Success', 'Purchase order created successfully!');
```

### Confirmation Dialog
```javascript
modalManager.confirm(
    'Delete Order?',
    'This action cannot be undone. Are you sure?',
    async () => {
        // Confirmed - delete operation
        await erp.deletePurchaseOrder(id);
        notify.success('Deleted');
    },
    () => {
        // Cancelled
        notify.info('Cancelled');
    }
);
```

### Custom Modal
```javascript
modalManager.create('details-modal', {
    title: 'Purchase Order Details',
    content: '<p>PO-2024-001</p><p>Status: Approved</p>',
    width: 'max-w-lg',
    buttons: [
        { label: 'Cancel', onclick: "modalManager.close('details-modal')" },
        { label: 'Approve', type: 'primary', onclick: "approveOrder('PO-001')" }
    ]
});
modalManager.open('details-modal');
```

---

## UTILITY FUNCTIONS

### Format Currency
```javascript
Utils.formatCurrency(1500.50); // Returns: "$1,500.50"
```

### Format Date
```javascript
Utils.formatDate('2024-12-09'); // Returns: "Dec 9, 2024"
```

### Get Form Data
```javascript
const data = Utils.getFormData(form);
// Returns: { fieldName: 'value', ... }
```

### Set Form Data
```javascript
Utils.setFormData(form, { name: 'John', email: 'john@example.com' });
```

### Clone Object
```javascript
const copy = Utils.clone(originalObject);
```

### Generate ID
```javascript
const id = Utils.generateId('PO'); // Returns: "PO1734207432-a1b2c3d4"
```

### Debounce Function
```javascript
const searchDebounced = Utils.debounce((term) => {
    filterCustomers(term);
}, 300);

searchInput.addEventListener('input', (e) => {
    searchDebounced(e.target.value);
});
```

### Check Empty
```javascript
if (Utils.isEmpty(value)) {
    notify.warning('Field is empty');
}
```

---

## DATA LOADING PATTERN

### Complete Example: PO List Page
```javascript
async function initializeTable() {
    try {
        LoadingManager.showOverlay('Loading purchase orders...');
        const pos = await erp.loadPurchaseOrders();
        renderPOTable(pos);
        LoadingManager.hideOverlay();
    } catch (error) {
        LoadingManager.hideOverlay();
        notify.error(`Error: ${error.message}`);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTable();
});

// Render function
function renderPOTable(pos) {
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = pos.map(po => `
        <tr>
            <td>${po.id}</td>
            <td>${po.supplierName}</td>
            <td>${Utils.formatCurrency(po.amount)}</td>
            <td>${Utils.formatDate(po.date)}</td>
            <td><span class="badge ${po.status.toLowerCase()}">${po.status}</span></td>
            <td>
                <button onclick="viewPO('${po.id}')"><i class="fas fa-eye"></i></button>
                <button onclick="deletePO('${po.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}
```

---

## FORM SUBMISSION PATTERN

### Complete Example: Create Customer
```javascript
async function saveCustomer(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    // Validation
    const schema = {
        name: ['required'],
        email: ['required', 'email'],
        phone: ['required', 'phone'],
        address: ['required'],
        city: ['required']
    };

    const formData = Utils.getFormData(form);
    const errors = validator.validate(formData, schema);
    if (!validator.displayErrors(form, errors)) {
        return;
    }

    try {
        LoadingManager.show(submitBtn, 'Creating customer...');
        const result = await erp.createCustomer(formData);
        notify.success(`Customer created: ${result.name}`);
        form.reset();
        validator.clearErrors(form);
        
        // Redirect after success
        setTimeout(() => {
            window.location.href = 'customers.html';
        }, 1000);
    } catch (error) {
        notify.error(`Error: ${error.message}`);
    } finally {
        LoadingManager.hide(submitBtn);
    }
}
```

---

## FILTERING PATTERN

### Search & Filter Example
```javascript
async function filterPOs() {
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
            filtered = filtered.filter(po => 
                po.supplierName.toLowerCase().includes(filters.supplier.toLowerCase())
            );
        }
        
        if (filters.poNumber) {
            filtered = filtered.filter(po => 
                po.id.includes(filters.poNumber.toUpperCase())
            );
        }

        renderPOTable(filtered);
        notify.info(`Found ${filtered.length} POs`);
    } catch (error) {
        notify.error(error.message);
    }
}
```

---

## DELETE WITH CONFIRMATION PATTERN

```javascript
async function deletePO(poId) {
    modalManager.confirm(
        'Delete PO?',
        `Are you sure you want to delete PO ${poId}? This cannot be undone.`,
        async () => {
            try {
                LoadingManager.showOverlay('Deleting...');
                await erp.deletePurchaseOrder(poId);
                notify.success('PO deleted successfully');
                LoadingManager.hideOverlay();
                location.reload();
            } catch (error) {
                LoadingManager.hideOverlay();
                notify.error(`Error: ${error.message}`);
            }
        }
    );
}
```

---

## DIALOG/MODAL PATTERN

### Show Details in Modal
```javascript
async function openPODetails(poId) {
    try {
        const po = await erp.getPurchaseOrder(poId);
        
        const content = `
            <div class="space-y-4">
                <div>
                    <p class="text-gray-600">PO Number:</p>
                    <p class="font-bold">${po.id}</p>
                </div>
                <div>
                    <p class="text-gray-600">Supplier:</p>
                    <p class="font-bold">${po.supplierName}</p>
                </div>
                <div>
                    <p class="text-gray-600">Amount:</p>
                    <p class="font-bold">${Utils.formatCurrency(po.amount)}</p>
                </div>
                <div>
                    <p class="text-gray-600">Status:</p>
                    <p class="font-bold">${po.status}</p>
                </div>
            </div>
        `;

        modalManager.create('po-modal', {
            title: `PO Details - ${po.id}`,
            content: content,
            width: 'max-w-lg',
            buttons: [
                { label: 'Close', onclick: "modalManager.close('po-modal')" },
                { label: 'Edit', type: 'primary', onclick: "editPO('" + po.id + "')" }
            ]
        });

        modalManager.open('po-modal');
    } catch (error) {
        notify.error(error.message);
    }
}
```

---

## VALIDATION RULES REFERENCE

```javascript
// Required field
'fieldName': ['required']

// Email validation
'email': ['email']

// Phone validation  
'phone': ['phone']

// Number validation
'count': ['number']

// Positive number
'quantity': ['positive']

// Date validation
'date': ['date']

// Date is after
'dueDate': [{ type: 'dateAfter', value: '2024-12-01' }]

// Date is before
'expiryDate': [{ type: 'dateBefore', value: '2024-12-31' }]

// Minimum length
'password': [{ type: 'minLength', value: 8 }]

// Maximum length
'code': [{ type: 'maxLength', value: 5 }]

// Minimum value
'age': [{ type: 'min', value: 18 }]

// Maximum value
'discount': [{ type: 'max', value: 100 }]

// Field matching
'confirmPassword': [{ type: 'match', value: 'password' }]

// Multiple rules
'email': ['required', 'email']
'quantity': ['required', 'positive', { type: 'max', value: 10000 }]
```

---

## STYLING FOR ERROR DISPLAY

Errors are automatically displayed with red styling:
```html
<!-- Input with error -->
<input class="border-red-500" ...>

<!-- Error message -->
<div class="error-message text-red-500 text-sm mt-1">Email is required</div>
```

---

## HTTP ERROR CODES HANDLED

All handlers catch and display errors from:
- Network failures
- Invalid data
- Server errors
- Validation errors
- Permission errors

Errors are shown in user-friendly format:
```javascript
notify.error('Error creating PO: Invalid supplier selected');
```

---

## BEST PRACTICES

✅ Always wrap async operations in try-catch  
✅ Show loading state during operations  
✅ Validate before submission  
✅ Show success/error notifications  
✅ Clear errors when form changes  
✅ Redirect after successful create/update  
✅ Use confirmations for destructive operations  
✅ Use modals for details/actions  
✅ Format currency, dates for display  
✅ Handle offline scenarios gracefully  

---

## DEBUGGING TIPS

### Check Errors in Console
```javascript
// Most handlers log to console
console.log('Form Data:', formData);
console.log('Validation Errors:', errors);
```

### Test Notifications
```javascript
notify.success('Test success');
notify.error('Test error');
```

### Test Loading State
```javascript
LoadingManager.showOverlay('Testing...');
setTimeout(() => LoadingManager.hideOverlay(), 3000);
```

### Test Modal
```javascript
modalManager.alert('Test', 'Modal is working!');
```

---

## TROUBLESHOOTING

**Q: Form not submitting?**  
A: Check browser console for validation errors, ensure form has `onsubmit="functionName(event)"` 

**Q: Notifications not showing?**  
A: Ensure `erp-utilities.js` is loaded, check for JS errors in console

**Q: Data not loading?**  
A: Check that `erp.loadData()` is being called, verify ERPDataManager is initialized

**Q: Modal not closing?**  
A: Use correct modal ID in close button: `onclick="modalManager.close('modal-id')"`

**Q: Validation not working?**  
A: Ensure input `name` attributes match schema keys, check validation rules

---

## LIVE EXAMPLES IN CODE

See implementation in these files:
- `frontend/procurement/create-po.html` - Complete create workflow
- `frontend/procurement/po-list.html` - Complete list/filter workflow
- `frontend/sales/customers.html` - Complete search workflow
- `frontend/production/work-orders.html` - Complete data loading workflow

All examples use the same patterns - reuse and adapt them!

