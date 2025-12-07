# Authentication & Login Guide

## Overview

The Textile ERP system now includes a complete authentication flow with login protection. Users must authenticate before accessing the dashboard.

## Authentication Flow

```
User visits application
        ↓
Check if authToken exists in localStorage
        ↓
   ┌─────────────────────┐
   │                     │
   ↓                     ↓
Token exists         No token
   ↓                     ↓
Redirect to         Redirect to
Dashboard           Login Page
   ↓                     ↓
/frontend/index.html    /frontend/login.html
   ↓                     ↓
   │              User submits credentials
   │                     ↓
   │              Call /api/auth/login
   │                     ↓
   │              Backend validates
   │                     ↓
   │         ┌───────────────────────┐
   │         │                       │
   │         ↓                       ↓
   │      Valid                  Invalid
   │         ↓                       ↓
   │      Return Token          Show Error
   │      & User Info            Message
   │         ↓                     
   │      Store in localStorage   
   │      (authToken, userInfo)   
   │         ↓                     
   └────────→ Redirect to Dashboard
              /frontend/index.html
```

## Login Page (`/frontend/login.html`)

### Features

- **Professional UI**: Modern gradient design with smooth animations
- **Form Validation**: Client-side validation for username and password
- **Error Handling**: Clear error messages for failed login attempts
- **Loading States**: Visual feedback during authentication
- **Demo Credentials**: Built-in demo account for testing
- **Remember Me**: Optional persistent login preference
- **Responsive Design**: Works on desktop, tablet, and mobile

### Demo Credentials

For testing purposes, use:
- **Username**: `admin`
- **Password**: `password123`

Click on the demo credentials box to auto-fill the form.

### API Integration

The login page calls the backend endpoint:
```
POST /api/auth/login
```

**Request Format** (OAuth2PasswordRequestForm):
```
username=admin&password=password123
Content-Type: application/x-www-form-urlencoded
```

**Response Format**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## Dashboard Page (`/frontend/index.html`)

### Authentication Check

The dashboard automatically:
1. Checks for `authToken` in `localStorage`
2. If token doesn't exist → redirects to login
3. If token exists → loads dashboard

```javascript
// Located in <head> section
(function() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/frontend/login.html';
    }
})();
```

### User Session Management

#### Stored Data

```javascript
// Authentication Token
localStorage.setItem('authToken', token);

// User Information (optional)
localStorage.setItem('userInfo', JSON.stringify(userInfo));

// Remember Me Preference
localStorage.setItem('rememberMe', 'true');
```

#### Accessing User Info

```javascript
function getUserInfo() {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
}

// Usage
const user = getUserInfo();
console.log(user.name); // Access user properties
```

## Logout Functionality

### Logout Button

Located in the sidebar, the logout button:
1. Shows a confirmation dialog
2. Clears all stored authentication data
3. Clears session storage
4. Redirects to login page

```javascript
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear all stored data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('rememberMe');
        sessionStorage.clear();
        
        // Redirect to login
        window.location.href = '/frontend/login.html';
    }
}
```

## Root Entry Point (`/index.html`)

The root index.html acts as an intelligent router:
- If user is logged in → redirects to dashboard
- If user is not logged in → redirects to login page

## Backend Requirements

### Auth Endpoint

The backend must provide an `/api/auth/login` endpoint that:
- Accepts OAuth2PasswordRequestForm with `username` and `password`
- Returns a JSON response with `access_token` and `token_type`
- Validates user credentials
- Handles errors appropriately

### Example Backend Response

**Success**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error**:
```json
{
  "detail": "Incorrect username or password"
}
```

## Protected API Calls

When making API calls from the dashboard, include the auth token:

```javascript
fetch('/api/some-endpoint', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
})
.then(response => response.json())
.then(data => console.log(data));
```

## Security Considerations

✅ **Implemented**:
- Tokens stored in localStorage (client-side)
- Automatic redirect to login when token missing
- Logout clears all session data
- Confirmation dialog on logout
- OAuth2 authentication on backend

⚠️ **To Implement**:
- HTTPS for production
- Token expiration/refresh mechanism
- Secure password hashing (on backend)
- CORS configuration
- Rate limiting on login attempts
- Two-factor authentication (optional)

## Troubleshooting

### "Redirected to login after clicking dashboard links"
**Cause**: AuthToken not being stored correctly  
**Solution**: Check browser console for API errors, verify backend is running

### "Login page shows immediately after logging in"
**Cause**: Token not being saved to localStorage  
**Solution**: Check browser's localStorage is enabled, check API response format

### "Dashboard loads but shows blank content"
**Cause**: Charts or content failed to load  
**Solution**: Check browser console for errors, verify API endpoints

### "Login fails with 'Incorrect username or password'"
**Cause**: Invalid credentials or user doesn't exist  
**Solution**: Verify demo credentials or create new user account

## Testing

### Manual Testing Checklist

- [ ] Open `/frontend/login.html` directly → should show login form
- [ ] Open `/frontend/index.html` without token → should redirect to login
- [ ] Login with demo credentials → should redirect to dashboard
- [ ] Refresh dashboard page → should stay on dashboard
- [ ] Click logout → should redirect to login
- [ ] Open login page after logout → form should be empty
- [ ] Click "Remember me" → preference should be saved

### Automated Testing

Run the test suite to verify authentication:
```bash
npm test
# or
pytest tests/test_auth.py
```

## API Endpoints Reference

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|----------------|
| `/api/auth/login` | POST | User login | No |
| `/api/auth/logout` | POST | User logout | Yes |
| `/api/auth/me` | GET | Get current user | Yes |
| `/api/auth/refresh` | POST | Refresh token | Yes |

## Best Practices

1. **Always check for token** before accessing protected pages
2. **Handle token expiration** gracefully
3. **Clear sensitive data** on logout
4. **Use HTTPS** in production
5. **Implement token refresh** for long sessions
6. **Validate on backend** for all operations
7. **Log authentication events** for security auditing

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify backend is running: `http://localhost:8000/docs`
3. Check API response format matches expectations
4. Enable debug mode for detailed logging

---

**Last Updated**: 2025-12-07  
**Version**: 1.0
