# Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Angular 17 Application                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │  │
│  │  │Components│  │ Services │  │  Guards  │          │  │
│  │  └──────────┘  └──────────┘  └──────────┘          │  │
│  │       │             │              │                │  │
│  │       └─────────────┼──────────────┘                │  │
│  │                     │                                │  │
│  │              ┌──────▼──────┐                        │  │
│  │              │ Interceptors│                        │  │
│  │              └──────┬──────┘                        │  │
│  └─────────────────────┼──────────────────────────────┘  │
│                        │                                  │
│              ┌─────────▼─────────┐                        │
│              │   HTTP / Socket   │                        │
│              └─────────┬─────────┘                        │
└────────────────────────┼──────────────────────────────────┘
                         │
┌────────────────────────┼──────────────────────────────────┐
│                        │        BACKEND API              │
│              ┌─────────▼─────────┐                        │
│              │   Express Server  │                        │
│              └─────────┬─────────┘                        │
│                        │                                  │
│  ┌─────────────────────┼─────────────────────┐          │
│  │                     │                     │          │
│  ┌──────────┐   ┌──────▼──────┐   ┌─────────┐          │
│  │Middleware│   │  Controllers│   │  Models │          │
│  │          │   │             │   │         │          │
│  │ • Auth   │   │ • Auth      │   │ • User  │          │
│  │ • RBAC   │   │ • Users     │   │ • Analytics│       │
│  │ • Validate│  │ • Analytics │   │ • Content│         │
│  │ • RateLimit│ │ • Content   │   │ • Audit │          │
│  └──────────┘   └──────┬──────┘   └────┬────┘          │
│                        │               │                │
│              ┌─────────▼───────────────▼────────┐       │
│              │      Mongoose ODM                │       │
│              └─────────┬────────────────────────┘       │
│                        │                                │
└────────────────────────┼────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │     MongoDB         │
              │                     │
              │  Collections:       │
              │  • users            │
              │  • analytics        │
              │  • content          │
              │  • auditlogs        │
              └─────────────────────┘
```

## Request Flow

### Authentication Flow

```
1. User submits login form
   ↓
2. Angular Service sends POST /api/auth/login
   ↓
3. Express receives request
   ↓
4. Rate Limiter checks request limit
   ↓
5. Controller validates credentials
   ↓
6. JWT tokens generated
   ↓
7. Response with user data + tokens
   ↓
8. Angular stores tokens in localStorage
   ↓
9. AuthInterceptor adds token to headers
```

### Protected Route Flow

```
1. User navigates to protected route
   ↓
2. AuthGuard checks token existence
   ↓
3. RoleGuard checks user role
   ↓
4. HTTP request sent with JWT in header
   ↓
5. Backend auth middleware validates token
   ↓
6. RBAC middleware checks permissions
   ↓
7. Controller processes request
   ↓
8. Response returned
```

### Realtime Analytics Flow

```
1. User opens Dashboard
   ↓
2. SocketService connects to Socket.io
   ↓
3. Client subscribes to 'analytics' room
   ↓
4. Server emits updates every 5 seconds
   ↓
5. Client receives data
   ↓
6. Dashboard component updates charts
```

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['superadmin', 'admin', 'moderator', 'viewer'],
  googleId: String (optional),
  avatar: String,
  isActive: Boolean,
  lastLogin: Date,
  refreshToken: String,
  timestamps
}
```

### Analytics Model
```javascript
{
  date: Date (indexed),
  activeUsers: Number,
  newSignups: Number,
  pageViews: Number,
  revenue: Number,
  transactions: Number,
  traffic: {
    organic: Number,
    direct: Number,
    referral: Number,
    social: Number,
    paid: Number
  },
  timestamps
}
```

### Content Model
```javascript
{
  title: String,
  slug: String (unique, auto-generated),
  content: String,
  type: Enum ['post', 'page', 'announcement', 'document'],
  status: Enum ['draft', 'published', 'archived'],
  author: ObjectId (ref: User),
  tags: [String],
  meta: {
    description: String,
    keywords: [String]
  },
  views: Number,
  timestamps
}
```

### AuditLog Model
```javascript
{
  user: ObjectId (ref: User),
  action: Enum ['create', 'update', 'delete', 'login', 'logout', 'view', 'export'],
  resource: String,
  resourceId: ObjectId,
  details: Mixed,
  ipAddress: String,
  userAgent: String,
  timestamps
}
```

## Security Layers

1. **Authentication**: JWT tokens with expiration
2. **Authorization**: Role-based access control (RBAC)
3. **Rate Limiting**: Prevents brute force attacks
4. **Input Validation**: Express-validator
5. **Password Hashing**: bcryptjs (12 rounds)
6. **Security Headers**: Helmet.js
7. **CORS**: Configured for frontend origin
8. **Audit Logging**: Track all admin actions

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Security**: Helmet, CORS, bcryptjs
- **Realtime**: Socket.io
- **Testing**: Jest

### Frontend
- **Framework**: Angular 17+
- **UI Library**: Angular Material
- **Charts**: Chart.js + ng2-charts
- **State Management**: RxJS Observables
- **HTTP Client**: Angular HttpClient
- **Realtime**: Socket.io-client
- **Testing**: Jasmine + Karma

## Deployment Architecture

### Docker Setup
- **MongoDB**: Containerized database with volume persistence
- **Backend**: Node.js container with environment variables
- **Frontend**: Nginx container serving built Angular app
- **Network**: Bridge network connecting all services

### Production Considerations
- Use environment variables for secrets
- Enable HTTPS/SSL
- Use process manager (PM2) for Node.js
- Set up MongoDB replica set for production
- Configure CDN for static assets
- Implement logging and monitoring
- Set up backup strategy for MongoDB

