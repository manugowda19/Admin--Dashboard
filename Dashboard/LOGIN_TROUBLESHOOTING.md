# Login Troubleshooting Guide

## Common Issues and Solutions

### 1. "Cannot connect to server" Error

**Problem**: Backend server is not running or not accessible.

**Solution**:
```bash
# Navigate to backend directory
cd backend

# Start the backend server
npm run dev

# You should see:
# ✅ MongoDB connected
# 🚀 Server running on port 3000
```

### 2. "Invalid credentials" Error

**Problem**: User doesn't exist or password is incorrect.

**Solution**:
```bash
# Make sure users are seeded in the database
cd backend
npm run seed

# Expected output:
# ✅ Created user: superadmin@example.com
# ✅ Created user: admin@example.com
# ✅ Created user: moderator@example.com
# ✅ Created user: viewer@example.com
```

**Default Credentials**:
- Email: `superadmin@example.com`
- Password: `password123`

### 3. CORS Error

**Problem**: Frontend cannot communicate with backend due to CORS restrictions.

**Solution**:
1. Check `backend/.env` file has:
   ```
   FRONTEND_URL=http://localhost:4200
   ```
2. Restart backend server after changing .env

### 4. MongoDB Connection Error

**Problem**: Backend cannot connect to MongoDB.

**Solution**:
1. Check MongoDB Atlas connection string in `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://admin:admin123@cluster1.ltkspsi.mongodb.net/admin-dashboard?retryWrites=true&w=majority
   ```
2. Ensure your IP is whitelisted in MongoDB Atlas Network Access
3. Verify database user credentials

### 5. Network Error / Connection Refused

**Problem**: Frontend cannot reach backend API.

**Check**:
1. Backend is running on `http://localhost:3000`
2. Frontend environment file has correct API URL:
   ```typescript
   // frontend/src/environments/environment.ts
   apiUrl: 'http://localhost:3000/api'
   ```
3. No firewall blocking port 3000

## Step-by-Step Debugging

### Step 1: Verify Backend is Running
```bash
# In backend directory
npm run dev
```

Check browser console for any errors.

### Step 2: Test Backend API Directly
Open browser and go to:
```
http://localhost:3000/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### Step 3: Test Login API
Use Postman or curl:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@example.com","password":"password123"}'
```

### Step 4: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Check the login request:
   - Status code
   - Response body
   - Error messages

### Step 5: Verify Users Exist
```bash
# Connect to MongoDB and check users
# Or run seed script again
cd backend
npm run seed
```

## Quick Fix Checklist

- [ ] Backend server is running (`npm run dev` in backend folder)
- [ ] Frontend server is running (`npm start` in frontend folder)
- [ ] Users are seeded (`npm run seed` in backend folder)
- [ ] MongoDB connection is working
- [ ] CORS is configured correctly
- [ ] No firewall blocking ports
- [ ] Using correct credentials:
  - Email: `superadmin@example.com`
  - Password: `password123`

## Still Having Issues?

1. Check browser console for detailed error messages
2. Check backend terminal for server errors
3. Verify all environment variables are set correctly
4. Try clearing browser cache and localStorage
5. Restart both frontend and backend servers

