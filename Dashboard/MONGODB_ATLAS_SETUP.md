# MongoDB Atlas Setup Guide

This application supports both local MongoDB and MongoDB Atlas (cloud database).

## Using MongoDB Atlas (Recommended for Production)

### Current Configuration
Your MongoDB Atlas connection string is configured:
```
mongodb+srv://admin:admin123@cluster1.ltkspsi.mongodb.net/admin-dashboard?retryWrites=true&w=majority
```

This connection string:
- Uses your MongoDB Atlas cluster: `cluster1.ltkspsi.mongodb.net`
- Database name: `admin-dashboard`
- Includes retry writes and write concern for reliability

### Setup Steps

1. **Copy the environment file**:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Verify the connection string** in `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://admin:admin123@cluster1.ltkspsi.mongodb.net/admin-dashboard?retryWrites=true&w=majority
   ```

3. **Ensure your MongoDB Atlas cluster allows connections**:
   - Go to MongoDB Atlas Dashboard
   - Click "Network Access" in the left menu
   - Add your IP address (or use `0.0.0.0/0` for all IPs - development only)
   - Click "Database Access" and ensure your user has read/write permissions

4. **Test the connection**:
   ```bash
   cd backend
   npm run seed
   ```
   This will create sample data and verify the connection.

5. **Start the backend server**:
   ```bash
   npm run dev
   ```

### Connection String Format
```
mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
```

### Security Notes
⚠️ **Important**: 
- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- For production, use environment variables or secrets management
- Consider using a read-only user for production if possible

### Troubleshooting

**Connection Timeout Error**:
- Check your IP address is whitelisted in MongoDB Atlas Network Access
- Verify the username and password are correct
- Ensure the cluster is not paused

**Authentication Failed**:
- Verify username and password in the connection string
- Check database user permissions in MongoDB Atlas

**SSL/TLS Error**:
- MongoDB Atlas requires SSL by default
- The connection string automatically uses SSL (mongodb+srv://)
- If issues persist, check your network/firewall settings

## Using Local MongoDB

If you prefer to use a local MongoDB instance:

1. Install MongoDB locally
2. Update `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/admin-dashboard
   ```
3. Start MongoDB service
4. Run the seed script

## Database Name

The default database name is `admin-dashboard`. You can change this in the connection string:
- MongoDB Atlas: `mongodb+srv://...@cluster.mongodb.net/YOUR_DB_NAME?retryWrites=true&w=majority`
- Local: `mongodb://localhost:27017/YOUR_DB_NAME`

