# AOM Trading Platform

A comprehensive trading education platform with subscription management, course delivery, and licensing integration.

## 🏗️ Architecture Overview

### **Tech Stack**
- **Frontend**: React 18 + TypeScript + React Router
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT + Google OAuth + Express Sessions
- **Payment Processing**: Stripe
- **Licensing**: NetLicensing
- **Styling**: CSS3 + React Hot Toast

## 📁 Project Structure

```
aom-trading/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── config/            # Database & passport config
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth middleware
│   │   ├── routes/           # API routes
│   │   ├── services/         # External service integrations
│   │   └── server.ts         # Main server file
│   ├── migrations/           # Database migration scripts
│   └── package.json
│
├── website/                   # React frontend
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── contexts/         # React Context (Auth)
│   │   ├── pages/           # Page components
│   │   ├── services/        # Frontend services
│   │   ├── types/           # TypeScript interfaces
│   │   ├── config/          # Course configuration
│   │   └── App.tsx          # Main app component
│   └── package.json
│
└── shared/                   # Shared resources (schemas, etc.)
    └── schemas/
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+
- PostgreSQL 14+
- Stripe account
- Google OAuth credentials
- NetLicensing account

### **Environment Setup**

**Backend** (`.env.development`):
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/aom_trading

# Authentication
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# NetLicensing
NET_LICENCE_API_KEY=your_netlicensing_api_key
NET_LICENCE_PRODUCT_ID=your_netlicensing_product_id

# URLs
FRONTEND_URL=http://localhost:3000
```

**Production Environment Variables** (set on hosting platform):
- All the above variables with production values
- `NODE_ENV=production` (usually set automatically)

### **Installation & Running**

```bash
# Install dependencies
cd backend && npm install
cd ../website && npm install

# Run development servers
cd backend && npm run dev      # Backend on :5001
cd website && npm start        # Frontend on :3000

# Production build
cd backend && npm run build && npm start
cd website && npm run build
```

## 🔧 Core Features

### **Authentication System**
- **Dual Authentication**: JWT tokens + Google OAuth sessions
- **JWT Priority**: JWT tokens override session cookies for consistency
- **Auto-redirect**: Logout redirects to login page
- **Session Management**: Express sessions with PostgreSQL store

### **Subscription Management**
- **Stripe Integration**: Payment processing and webhooks
- **License Generation**: Automatic NetLicensing license creation
- **Subscription Status**: Trial, active, expired tracking
- **User Dashboard**: My Subscriptions page with status display

### **Course System**
- **Dynamic Structure**: JSON-based course configuration
- **5 Core Chapters**: 
  1. Fundamentals of Trading
  2. Technical Analysis  
  3. Trading Strategies
  4. Risk Management
  5. Trading Psychology
- **Interactive Learning**: Lessons + quizzes with progress tracking
- **Completion System**: Visual progress indicators and badges

### **Methodology Disclaimer**
- **One-time Modal**: CFTC Rule 4.41 compliance
- **Database Tracking**: User acknowledgment persistence
- **Required Viewing**: Appears on first My Subscriptions visit

## 🗄️ Database Schema

### **Core Tables**
- `users` - User accounts and profiles
- `subscriptions` - User subscription records
- `products` - Available subscription products
- `session` - Express session storage

### **Course Progress** (Planned)
- User completion tracking for lessons/quizzes
- Progress percentages and timestamps
- Achievement/certificate system

## 🔗 API Endpoints

### **Authentication**
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/register` - User registration
- `GET /api/auth/google` - Google OAuth initiation
- `GET /api/auth/profile` - User profile
- `POST /api/auth/logout` - Session cleanup
- `POST /api/auth/methodology-disclaimer` - Disclaimer acknowledgment

### **Subscriptions**
- `GET /api/subscriptions/products` - Available products
- `GET /api/subscriptions/my-subscriptions` - User's subscriptions
- `POST /api/payments/create-payment-intent` - Stripe payment
- `POST /api/payments/stripe-webhook` - Stripe webhooks

### **Course System**
- Course content loaded from JSON configuration
- Lesson/quiz routing: `/my-subscriptions/study-course/:chapterId/lesson/:lessonId`
- Quiz routing: `/my-subscriptions/study-course/:chapterId/quiz/:quizId`

## 🎨 Frontend Architecture

### **Component Structure**
- **Pages**: Route-level components (`StudyCourse`, `LessonPage`, `QuizPage`)
- **Common Components**: Reusable UI elements (`Header`, `Footer`)
- **Context**: Global state management (`AuthContext`)

### **Course Configuration**
JSON-driven course structure in `/website/src/config/trading-course.json`:
```json
{
  "courseId": "trading-fundamentals",
  "chapters": [
    {
      "chapterId": "trading-basics",
      "lessons": [...],
      "quizzes": [...]
    }
  ]
}
```

### **Styling Approach**
- **Consolidated CSS**: Single `StudyCourse.css` for course-related components
- **Responsive Design**: Mobile-first approach
- **Brand Colors**: AOM green (#92E3A9) with professional palette

## 🚦 Authentication Flow

1. **Login**: Email/password or Google OAuth
2. **JWT Generation**: Server creates JWT token
3. **Token Priority**: JWT overrides any existing session cookies
4. **Profile Loading**: User data fetched and stored in React Context
5. **Protected Routes**: Subscription-gated content access

## 💳 Payment & Licensing Flow

1. **Product Selection**: User chooses subscription plan
2. **Stripe Payment**: Secure payment processing
3. **Webhook Processing**: Payment confirmation triggers:
   - Subscription record creation
   - NetLicensing license generation
   - License numbers stored in database
4. **Access Granted**: User gains access to protected content

## 🏛️ Deployment Architecture

### **Development**
- **Frontend**: React dev server (:3000)
- **Backend**: Nodemon + ts-node (:5001)
- **Database**: Local PostgreSQL
- **Environment**: `.env.development` files

### **Production**
- **Frontend**: Static build deployed to CDN/hosting
- **Backend**: Compiled JavaScript on cloud platform
- **Database**: Managed PostgreSQL (Render/Heroku/AWS)
- **Environment**: Platform environment variables
- **HTTPS**: SSL certificates and secure cookies

## 🔐 Security Features

- **Environment Variables**: Secrets never in code
- **JWT Expiration**: 7-day token lifecycle
- **CORS Configuration**: Restricted cross-origin access
- **Input Validation**: Request sanitization
- **Session Security**: HTTP-only cookies, CSRF protection
- **Database**: Parameterized queries prevent SQL injection

## 📈 Monitoring & Logging

- **Request Logging**: Morgan HTTP request logger
- **Error Handling**: Centralized error middleware
- **User Tracking**: Authentication success/failure logs
- **Payment Logs**: Stripe webhook processing logs
- **License Logs**: NetLicensing API interaction logs

## 🚧 Future Enhancements

- **Course Progress API**: Backend endpoints for lesson/quiz completion
- **Content Management**: File-based lesson content loading
- **Certificates**: Completion certificates and achievements
- **Analytics**: User engagement and progress tracking
- **Mobile App**: React Native companion app
- **Live Trading**: Real-time market data integration

## 🤝 Development Workflow

1. **Feature Branches**: Work on feature-specific branches
2. **Environment Sync**: Keep development env vars updated
3. **Database Migrations**: Version-controlled schema changes
4. **Testing**: Manual testing in development environment
5. **Deployment**: Build and deploy to production

## 🔐 Google OAuth Hosting Management

### **Google Cloud Console Setup**
1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select/Create Project**: Choose existing project or create new one
3. **Enable APIs**: Navigate to "APIs & Services" → "Library" → Enable "Google+ API"
4. **Create OAuth Credentials**: 
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"

### **OAuth Configuration**
**Development Setup:**
```
Application type: Web application
Name: AOM Trading (Development)
Authorized JavaScript origins: 
  - http://localhost:3000
  - http://localhost:5001
Authorized redirect URIs:
  - http://localhost:5001/api/auth/google/callback
```

**Production Setup:**
```
Application type: Web application  
Name: AOM Trading (Production)
Authorized JavaScript origins:
  - https://your-frontend-domain.com
  - https://your-backend-domain.onrender.com
Authorized redirect URIs:
  - https://your-backend-domain.onrender.com/api/auth/google/callback
```

### **Environment Variables Setup**
**Development (.env.development):**
```env
GOOGLE_CLIENT_ID=your_dev_client_id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_dev_client_secret
FRONTEND_URL=http://localhost:3000
```

**Production (Render Environment Variables):**
```env
GOOGLE_CLIENT_ID=your_prod_client_id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_prod_client_secret  
FRONTEND_URL=https://your-frontend-domain.com
```

### **Common Issues & Troubleshooting**

**"No routes matched location /api/auth/google":**
- ✅ Verify backend server is running and deployed
- ✅ Check that route is properly registered in server.ts
- ✅ Confirm CORS configuration allows frontend domain
- ✅ Ensure OAuth redirect URI matches exactly (case-sensitive)

**"redirect_uri_mismatch" Error:**
- ✅ Update Google OAuth authorized redirect URIs to match deployment URL
- ✅ Format: `https://your-backend-domain.onrender.com/api/auth/google/callback`
- ✅ No trailing slashes, exact match required

**OAuth Button Not Working:**
- ✅ Check browser console for JavaScript errors
- ✅ Verify Google Client ID is correctly set in environment variables
- ✅ Ensure frontend can reach backend API endpoints

### **Deployment Checklist**
1. **Google Console**: Update authorized origins and redirect URIs for production domain
2. **Environment Variables**: Set production GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET on hosting platform
3. **Frontend URL**: Update FRONTEND_URL environment variable to production domain
4. **CORS**: Verify backend CORS configuration includes production frontend domain
5. **HTTPS**: Ensure all URLs use HTTPS in production (Google OAuth requires HTTPS)

## 📞 Support & Contact

- **Technical Issues**: Check server logs and environment variables
- **Course Content**: Update JSON configuration files
- **Payment Issues**: Verify Stripe webhook endpoints
- **Authentication Problems**: Clear localStorage and session cookies
- **Google OAuth Issues**: Verify redirect URIs and client credentials in Google Cloud Console