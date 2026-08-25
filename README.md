# Farmart

A livestock e-commerce marketplace. Farmers list animals (cattle, breeds, etc.), buyers browse, add to cart, checkout, pay and track deliveries.

## Project Structure

```
farmart/
├── backend/    # Flask REST API (Python)
├── Frontend/   # React 19 + Vite + Redux Toolkit SPA
└── .github/    # CI workflows
```

## Tech Stack

| Layer | Technologies |
|---|---|
| Backend | Flask, Flask-SQLAlchemy, Marshmallow, Flask-JWT-Extended, Flask-CORS, Flask-Migrate |
| Database | SQLite (dev) via DATABASE_URL env var |
| Frontend | React 19, Vite, Redux Toolkit, React Router v7, Axios, Jest + Testing Library |
| Testing | pytest (backend), Jest (frontend) |

## Getting Started

### 1. Backend (port 5000)

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
# create a .env with:
# DATABASE_URL=sqlite:///farmart.db
# JWT_SECRET_KEY=change-me
flask run
```

API is served at http://localhost:5000/api.

### 2. Frontend (port 5173)

```bash
cd Frontend
npm install
npm run dev
```

Frontend/.env points at VITE_API_URL=http://localhost:5000/api.
CORS on the backend allows http://localhost:5173 by default (configurable via CORS_ORIGINS).

## Running Tests

```bash
cd backend && python -m pytest          # 111 tests
cd Frontend && npm test                 # 35 tests
```

## API Overview

All endpoints are prefixed with /api:

- POST /api/auth/register, POST /api/auth/login - returns { user, token }
- /api/farmers, /api/animal-types, /api/breeds, /api/animals (+ /search, /<id>/images)
- /api/carts, /api/carts/<id>/items
- /api/orders, /api/orders/<id>/items, /api/orders/<id>/status
- /api/payments (+ status updates), /api/deliveries (+ status updates)

## Git Workflow

- develop - integration branch
- feature/* - feature branches merged into develop via pull requests
