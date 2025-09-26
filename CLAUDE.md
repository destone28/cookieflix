# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cookieflix is a subscription service for 3D-printed cookie cutters. Users subscribe to monthly, quarterly, semi-annual, or annual plans, choose theme categories, and receive monthly cookie cutter sets based on community voting.

The system consists of:
- **Backend**: FastAPI (Python) with SQLAlchemy ORM and SQLite database
- **Frontend**: React + Vite with Tailwind CSS
- **Admin Panel**: Separate React application for system management
- **Payment Integration**: Stripe for subscription handling

## Development Commands

### Backend (FastAPI)
```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Alternative run method
python app/main.py

# Database migrations (Alembic)
alembic revision --autogenerate -m "Description"
alembic upgrade head

# Utility scripts
python enable_admin.py          # Enable admin user
python check_admin.py           # Check admin status
python admin_token_generator.py # Generate admin tokens
```

### Frontend (React + Vite)
```bash
cd cookieflix-frontend
npm install
npm run dev     # Development server
npm run build   # Production build
npm run lint    # ESLint
npm run preview # Preview build
```

### Admin Panel
```bash
cd cookieflix-admin
npm install
npm run dev     # Development server
npm run build   # Production build
npm run lint    # ESLint
npm run preview # Preview build
```

## Architecture

### Backend Structure
- **`app/main.py`**: FastAPI application entry point with middleware and router registration
- **`app/config.py`**: Configuration using Pydantic settings with environment variables
- **`app/database.py`**: SQLAlchemy engine and session management
- **`app/models/`**: SQLAlchemy models (User, Subscription, Product, etc.)
- **`app/routers/`**: API route handlers:
  - `auth.py`: Authentication and JWT tokens
  - `users.py`: User management
  - `products.py`: Categories, designs, and voting
  - `subscriptions.py`: Subscription plans and management
  - `admin.py`: Admin panel endpoints with diagnostics
  - `webhooks.py`: Stripe webhook handling
  - `shipments.py`: Shipping management

### Database Models
Key relationships:
- User → Subscription (one-to-many)
- User → Vote (one-to-many)
- Category → Design (one-to-many)
- Design → Vote (one-to-many)
- Subscription → SubscriptionPlan (many-to-one)

### Frontend Structure
- **Pages**: Home, Login, Register, Dashboard, Profile, Catalog, Subscription management
- **Components**: Reusable UI components with Tailwind CSS
- **Authentication**: JWT token-based with automatic refresh
- **API Integration**: Axios for HTTP requests to FastAPI backend

### Admin Panel Features
- User management and statistics
- Subscription analytics with charts
- API diagnostics and health monitoring
- Design and category management
- System monitoring dashboard

## Key Configuration

### Environment Variables
Required in `.env` file:
- `SECRET_KEY`: JWT signing key
- `STRIPE_API_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook endpoint secret
- `DATABASE_URL`: Database connection (default: sqlite:///./cookieflix.db)
- `FRONTEND_URL`: Frontend URL for CORS

### Security Features
- JWT authentication with 7-day expiration
- CORS middleware configured
- Security headers (CSP, HSTS, etc.) in middleware
- Admin-only routes with role-based access

### Database Migrations
- Uses Alembic for schema migrations
- Configuration in `alembic.ini`
- Migration files in `migrations/versions/`
- Auto-generates migrations based on model changes

## Development Notes

### Testing
- No formal test framework currently configured
- Manual testing via API endpoints and admin diagnostics panel

### Payment Integration
- Stripe integration for subscription management
- Webhook handling for subscription lifecycle events
- Customer portal for subscription management

### Logging
- Structured logging with custom setup in `app/utils/logging.py`
- Request/response middleware logging
- Error handling with user-friendly messages in Italian