# Quick Start with MongoDB Atlas

## Your MongoDB Atlas Connection

✅ Your MongoDB Atlas connection string is ready:
```
mongodb+srv://admin:admin123@cluster1.ltkspsi.mongodb.net/admin-dashboard?retryWrites=true&w=majority
```

## Quick Setup Steps

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# The .env file already has your MongoDB Atlas connection string configured!
# Just verify it looks like this:
# MONGODB_URI=mongodb+srv://admin:admin123@cluster1.ltkspsi.mongodb.net/admin-dashboard?retryWrites=true&w=majority
```

### 2. Configure MongoDB Atlas Access

**IMPORTANT**: Before connecting, you must:

1. **Whitelist Your IP Address**:
   - Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com)
   - Click "Network Access" in left menu
   - Click "Add IP Address"
   - Add your current IP (or `0.0.0.0/0` for all IPs - development only)
   - Click "Confirm"

2. **Verify Database User**:
   - Click "Database Access" in left menu
   - Ensure user `admin` exists with password `admin123`
   - User should have "Read and write to any database" role

### 3. Seed the Database

```bash
# From backend directory
npm run seed
```

Expected output:
```
✅ Created user: superadmin@example.com
✅ Created user: admin@example.com
✅ Created user: moderator@example.com
✅ Created user: viewer@example.com
✅ Created analytics for 2024-...
✅ Seed completed!
```

### 4. Start Backend Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 3000
```

### 5. Start Frontend

```bash
# Open new terminal
cd frontend
npm install
npm start
```

### 6. Login

1. Open browser: `http://localhost:4200`
2. Login with:
   - Email: `superadmin@example.com`
   - Password: `password123`

## Troubleshooting

### Connection Timeout
**Problem**: `MongoServerError: connection timed out`

**Solution**: 
- Check MongoDB Atlas Network Access → Add your IP address
- Verify the cluster is not paused
- Check internet connection

### Authentication Failed
**Problem**: `MongoServerError: authentication failed`

**Solution**:
- Verify username: `admin`
- Verify password: `admin123`
- Check Database Access → User permissions

### SSL/TLS Error
**Problem**: SSL connection issues

**Solution**:
- MongoDB Atlas uses SSL by default (mongodb+srv://)
- The connection string already includes SSL
- Check firewall/antivirus isn't blocking connection

## Connection String Format

Your connection string breakdown:
```
mongodb+srv://[username]:[password]@[cluster]/[database]?[options]
```

- **Protocol**: `mongodb+srv://` (uses DNS SRV records + SSL)
- **Username**: `admin`
- **Password**: `admin123`
- **Cluster**: `cluster1.ltkspsi.mongodb.net`
- **Database**: `admin-dashboard`
- **Options**: `retryWrites=true&w=majority` (reliability settings)

## Security Recommendations

⚠️ **For Production**:

1. Create a dedicated database user (not admin)
2. Use strong, unique passwords
3. Restrict IP access to your application servers only
4. Enable MongoDB Atlas monitoring and alerts
5. Use environment variables or secrets management (not hardcoded)
6. Enable MongoDB Atlas backup service
7. Review and update connection string regularly

## Next Steps

- ✅ Database is connected and seeded
- ✅ Backend server is running
- ✅ Frontend is running
- 🎉 You're ready to use the Admin Dashboard!

For more details, see:
- [MONGODB_ATLAS_SETUP.md](MONGODB_ATLAS_SETUP.md) - Detailed Atlas setup
- [README.md](README.md) - Full documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture overview

