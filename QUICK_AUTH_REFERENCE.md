# 🚀 Quick Start Guide - Authentication

## What's New

Your Textile ERP system now has a **complete login system**! Users must authenticate before accessing the dashboard.

## 📋 Quick Access Guide

### For Users

| What | Where | How |
|------|-------|-----|
| Login | `http://localhost:3000` | Enter admin / password123 |
| Dashboard | After login | Accessible after successful authentication |
| Logout | Top right menu | Click username → Logout |

### For Developers

| File | Purpose | Location |
|------|---------|----------|
| Login Page | Authentication UI | `/frontend/login.html` |
| Dashboard | Protected page | `/frontend/index.html` |
| Root Router | Smart redirects | `/index.html` |
| Auth Guide | Full documentation | `/md/AUTHENTICATION_GUIDE.md` |

## 🧪 Testing in 60 Seconds

### Method 1: Automatic Test
```powershell
.\test_auth.ps1
```

### Method 2: Manual Test
1. **Start backend** (if not running):
   ```bash
   docker-compose up backend
   ```

2. **Open browser**:
   ```
   http://localhost:3000
   ```

3. **Expected behavior**:
   - Should redirect to `/frontend/login.html`
   - Shows login form
   - Enter credentials: `admin` / `password123`
   - Click "Sign In"
   - Redirects to dashboard

4. **Test logout**:
   - Click profile menu (top right)
   - Click "Logout"
   - Should return to login page

## 📝 Demo Credentials

```
Username: admin
Password: password123
```

> **Tip**: Click the blue "📝 Demo Credentials" box to auto-fill the form!

## 🔐 Authentication Flow

```
Clear Browser Data
        ↓
Open http://localhost:3000
        ↓
Check for authToken
        ↓
   NO token     →  Redirect to Login Page
        ↓
   YES token    →  Load Dashboard
        ↓
User Enters Credentials
        ↓
Call /api/auth/login
        ↓
Validate with Backend
        ↓
   SUCCESS    →  Store Token → Redirect to Dashboard
        ↓
   FAILED     →  Show Error Message
```

## 💾 Storage Overview

### LocalStorage Keys
```javascript
// Authentication Token (required)
localStorage.getItem('authToken')
// Returns: "eyJhbGciOiJIUzI1NiI..."

// User Information (optional)
localStorage.getItem('userInfo')
// Returns: '{"user_id": 1, "username": "admin", ...}'

// Remember Me Preference
localStorage.getItem('rememberMe')
// Returns: "true" or null
```

### Check in Browser DevTools
1. Open DevTools (F12)
2. Go to "Application" tab
3. Look at "Local Storage"
4. Click "localhost:3000"
5. View the stored data

## 🐛 Common Issues

### Issue: "Redirected to login after login"
**Cause**: Token not being stored  
**Fix**: Check browser console (F12) → Console tab for errors

### Issue: "Login button doesn't work"
**Cause**: Backend not running  
**Fix**: Start backend with `docker-compose up backend`

### Issue: "Browser keeps showing login page"
**Cause**: localStorage might be disabled  
**Fix**: Check browser settings and enable localStorage

### Issue: "Can't see backend API errors"
**Fix**: Check backend logs:
```bash
docker logs textile_erp_backend --tail 50
```

## 🛠️ For Developers - Adding Auth to API Calls

When calling backend APIs from the dashboard, include the token:

```javascript
// Example: Fetch user's procurement orders
const token = localStorage.getItem('authToken');

fetch('/api/procurement/po-list', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => console.log(data));
```

## 📁 File Structure

```
Frontend/
├── index.html              # Dashboard (PROTECTED)
│   └── Auth check in <head>
│   └── Logout button in sidebar
│
├── login.html              # Login Page (NEW!)
│   ├── Beautiful UI
│   ├── Form validation
│   ├── Error handling
│   └── API integration
│
└── assets/
    └── (CSS, JS, images)
```

## ✅ Checklist

- [x] Login page created
- [x] Dashboard protected
- [x] Authentication check on load
- [x] Logout functionality
- [x] Token storage
- [x] Root router configured
- [x] Documentation written
- [x] Test script provided

## 📚 Learn More

| Document | Contains |
|----------|----------|
| `/md/AUTHENTICATION_GUIDE.md` | Complete technical documentation |
| `/AUTHENTICATION_SETUP_COMPLETE.md` | Detailed setup and requirements |
| `test_auth.ps1` | Automated testing script |

## 🚦 Next Steps

1. **Test the login** (see Quick Test above)
2. **Review the dashboard** after login
3. **Check all module links** work correctly
4. **Test logout** functionality
5. **Review authentication docs** for production setup

## 🎯 Production Checklist

When deploying to production:

- [ ] Use HTTPS (not HTTP)
- [ ] Configure token expiration
- [ ] Implement token refresh
- [ ] Add rate limiting to login
- [ ] Use secure cookies
- [ ] Enable CORS correctly
- [ ] Implement CSRF protection
- [ ] Add request logging
- [ ] Setup monitoring/alerts
- [ ] Plan backup strategy

## 📞 Support

**If something isn't working**:

1. Check backend is running:
   ```bash
   docker ps
   ```

2. Check backend logs:
   ```bash
   docker logs textile_erp_backend
   ```

3. Check browser console (F12 → Console)

4. Review `/md/AUTHENTICATION_GUIDE.md` for detailed info

---

**Status**: ✅ Ready to Use  
**Version**: 1.0  
**Last Updated**: 2025-12-07

**Questions?** Check the full documentation in `/md/AUTHENTICATION_GUIDE.md`
