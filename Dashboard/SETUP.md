# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB running locally (or use Docker)
- npm or yarn

## Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Your MongoDB Atlas connection is already configured!
# Connection string: mongodb+srv://admin:admin123@cluster1.ltkspsi.mongodb.net/admin-dashboard?retryWrites=true&w=majority
#
# IMPORTANT: Before running the seed script, ensure:
# 1. Your IP address is whitelisted in MongoDB Atlas Network Access
# 2. The database user has read/write permissions
# 3. Update JWT_SECRET and JWT_REFRESH_SECRET in .env file

# Seed the database
npm run seed

# Start backend server
npm run dev
```

The backend will start on `http://localhost:3000`

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will start on `http://localhost:4200`

### 3. Access the Application

1. Open browser: `http://localhost:4200`
2. Login with default credentials:
   - Email: `superadmin@example.com`
   - Password: `password123`

### 4. Docker Setup (Alternative)

```bash
# From root directory
docker-compose up -d

# Access:
# Frontend: http://localhost
# Backend: http://localhost:3000
```

## Default Users

| Email | Password | Role |
|-------|----------|------|
| superadmin@example.com | password123 | superadmin |
| admin@example.com | password123 | admin |
| moderator@example.com | password123 | moderator |
| viewer@example.com | password123 | viewer |

## Troubleshooting

1. **MongoDB connection error**: Ensure MongoDB is running
2. **Port already in use**: Change ports in .env or docker-compose.yml
3. **CORS errors**: Verify FRONTEND_URL in backend .env matches frontend URL

