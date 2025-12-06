# Admin Dashboard with Analytics & Reporting

A complete enterprise-grade MEAN stack (MongoDB, Express.js, Angular, Node.js) admin dashboard application with realtime analytics, user management, content management, and role-based access control.

## 🚀 Features

### Backend (Node.js + Express + MongoDB)
- ✅ JWT Authentication with refresh tokens
- ✅ Role-Based Access Control (RBAC): superadmin, admin, moderator, viewer
- ✅ User Management (CRUD operations)
- ✅ Analytics APIs (Active Users, Signups, Traffic, Sales)
- ✅ Realtime updates via Socket.io
- ✅ Content Management APIs
- ✅ Audit Logging
- ✅ Security: Helmet, CORS, Rate Limiting, Input Validation

### Frontend (Angular 17+)
- ✅ Modern Angular Material UI with Deep Indigo theme
- ✅ Responsive dashboard with realtime charts (Chart.js + ng2-charts)
- ✅ User Management interface (Admin only)
- ✅ Content Management module
- ✅ Authentication guards and role guards
- ✅ Error and loading interceptors
- ✅ Realtime Socket.io integration

## 📁 Project Structure

```
Dashboard/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth, RBAC, validation, error handling
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── scripts/         # Seed scripts
│   │   ├── socket/          # Socket.io setup
│   │   ├── utils/           # Utility functions
│   │   └── server.js        # Entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Angular components
│   │   │   ├── guards/      # Route guards
│   │   │   ├── interceptors/# HTTP interceptors
│   │   │   ├── services/    # Angular services
│   │   │   └── app.module.ts
│   │   ├── assets/
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.scss
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB (or use Docker)
- Docker and Docker Compose (optional)

### Local Development Setup

#### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from env.example)
cp env.example .env

# The .env file is already configured with your MongoDB Atlas connection string:
# MONGODB_URI=mongodb+srv://admin:admin123@cluster1.ltkspsi.mongodb.net/admin-dashboard?retryWrites=true&w=majority
# 
# Make sure to:
# 1. Update JWT_SECRET and JWT_REFRESH_SECRET with secure random strings
# 2. Configure MongoDB Atlas Network Access to allow your IP address
# 3. Verify database user permissions in MongoDB Atlas

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:3000`

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will run on `http://localhost:4200`

### Docker Setup

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

Access:
- Frontend: `http://localhost`
- Backend API: `http://localhost:3000`
- MongoDB: `localhost:27017`

## 🔐 Default Users

After seeding, you can login with:

| Email | Password | Role |
|-------|----------|------|
| superadmin@example.com | password123 | superadmin |
| admin@example.com | password123 | admin |
| moderator@example.com | password123 | moderator |
| viewer@example.com | password123 | viewer |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - Get all users (with pagination, search, filter)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Analytics
- `GET /api/analytics/active-users` - Get active users data
- `GET /api/analytics/signups` - Get daily signups
- `GET /api/analytics/traffic` - Get traffic metrics
- `GET /api/analytics/sales` - Get sales metrics
- `GET /api/analytics/kpis` - Get KPI summary
- `POST /api/analytics` - Create/update analytics (Admin only)

### Content
- `GET /api/content` - Get all content (with pagination, search, filter)
- `GET /api/content/:id` - Get content by ID
- `POST /api/content` - Create content (Moderator+)
- `PUT /api/content/:id` - Update content (Moderator+)
- `DELETE /api/content/:id` - Delete content (Moderator+)

### Audit Logs (Admin only)
- `GET /api/audit` - Get audit logs

## 🎨 UI Components

### Dashboard
- **KPI Cards**: Total Users, Active Users, Revenue, Transactions
- **Charts**:
  - Line Chart: Active Users (Last 7 Days) - Realtime updates
  - Bar Chart: Sales Revenue (Last 30 Days)
  - Pie Chart: Daily Signups (Last 30 Days)

### User Management
- User listing with pagination
- Search and filter by role
- Create, Edit, Delete users
- Role assignment

### Content Management
- Content listing with pagination
- Search and filter by type and status
- Create, Edit, Delete content
- Content types: post, page, announcement, document

## 🔒 Security Features

1. **JWT Authentication**: Secure token-based auth with refresh tokens
2. **Role-Based Access Control**: 4-tier role system
3. **Rate Limiting**: Prevents brute force attacks
4. **Input Validation**: Express-validator for request validation
5. **Helmet**: Security headers
6. **CORS**: Configured for frontend origin
7. **Password Hashing**: bcryptjs for secure password storage
8. **Audit Logging**: Track all admin actions

## 🔄 Realtime Features

- **Socket.io Integration**: Real-time analytics updates
- **WebSocket Connection**: Authenticated Socket.io connections
- **Live Dashboard**: KPIs update every 5 seconds

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Production Build

### Backend
```bash
cd backend
npm install --production
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Output in dist/admin-dashboard/
```

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=http://localhost:4200
MONGODB_URI=mongodb://localhost:27017/admin-dashboard
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚢 Deployment

### Docker Deployment
1. Update environment variables in `docker-compose.yml`
2. Run `docker-compose up -d`
3. Access application at configured ports

### Manual Deployment
1. Set up MongoDB instance
2. Configure backend environment variables
3. Build and deploy backend
4. Build frontend and serve with nginx/apache
5. Configure reverse proxy for API calls

## 📝 Architecture

### Backend Architecture
```
Client Request
    ↓
Express Middleware (Helmet, CORS, Body Parser)
    ↓
Rate Limiter
    ↓
Auth Middleware (JWT Verification)
    ↓
RBAC Middleware (Role Check)
    ↓
Controller
    ↓
MongoDB (via Mongoose)
```

### Frontend Architecture
```
Angular App
    ↓
Guards (Auth, Role)
    ↓
Components
    ↓
Services (HTTP Client)
    ↓
Interceptors (Auth, Error, Loader)
    ↓
Backend API
```

## 🐛 Troubleshooting

1. **MongoDB Connection Error**: Ensure MongoDB is running and connection string is correct
2. **CORS Errors**: Verify `FRONTEND_URL` in backend `.env` matches frontend URL
3. **JWT Errors**: Check token expiration and secret keys
4. **Socket.io Connection**: Verify token is included in Socket.io auth

## 📄 License

ISC

## 👥 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For issues and questions, please open an issue on the repository.

---

**Built with ❤️ using MEAN Stack**

