# Farmart

Farmart is a Kenyan livestock marketplace connecting farmers and buyers directly. Farmers can publish real animal listings with photos, while buyers can browse, filter, inspect, cart, checkout, pay through the configured payment flow, and track orders.

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
| Database | SQLite locally; PostgreSQL in production |
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
cd backend && python -m pytest          # 205 tests
cd Frontend && npm test                 # 35 tests
```

The backend suite covers schemas, authentication, farmer ownership, animals and images, carts, checkout, payments, deliveries, and order lifecycle rules. Frontend tests cover Redux state and core UI behavior.

## Marketplace Capabilities
- Supported animal categories: Cattle, Goats, Sheep, Chicken, Rabbits, Pigs, and Other.
- Farmers can register a profile from their authenticated account and publish listings with optional or custom breeds.
- Listings support up to five JPG, JPEG, PNG, or WEBP images, with a selectable primary image and category-specific fallback imagery when no photo exists.
- Buyer flow: browse the homepage and Store, filter listings, view animal details, add an individual animal to the cart, checkout, pay through the configured payment flow, and view orders.
- Farmer flow: register, create a profile, add and manage listings, receive incoming orders, and update order status.
- Order lifecycle: cart items become order items using server-side prices; animals are reserved at checkout, restored when an order is cancelled or rejected, and marked sold when completed.
- Ask Farmart is a local guided-help assistant. It does not claim to connect to an external AI provider unless one is added.

## External Configuration
- M-Pesa STK payments require Safaricom sandbox or production credentials and a reachable callback URL. Without them, payment requests fail honestly and are not reported as successful.
- Google Places autocomplete is not required for the fallback flow. Kenyan county/location text input and filtering work without an API key. Google Places can be configured separately through environment variables when available.

## API Overview
All endpoints are prefixed with /api:

- POST /api/auth/register, POST /api/auth/login - returns { user, token }
- /api/farmers, /api/animal-types, /api/breeds, /api/animals (+ /search, /<id>/images)
- /api/carts, /api/carts/<id>/items
- /api/orders, /api/orders/<id>/items, /api/orders/<id>/status
- /api/payments (+ status updates), /api/deliveries (+ status updates)

## Render deployment

The repository includes a [Render Blueprint](render.yaml) that creates a
PostgreSQL database, a Flask web service, and a Vite static site. Connect the
repository in Render using **New + → Blueprint**, then set the values marked
as needing manual configuration. Render deploys from Git directly, so the old
Vercel deployment workflow has been removed; GitHub Actions remains CI only.

Set these values in Render without committing their contents:

- Backend: `CORS_ORIGINS`, `FRONTEND_URL`, `CLOUDINARY_CLOUD_NAME`,
  `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `OPENAI_API_KEY`,
  `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`,
  `MPESA_SHORTCODE`, `MPESA_CALLBACK_URL`, `MAIL_USERNAME`, `MAIL_PASSWORD`,
  and `MAIL_DEFAULT_SENDER`.
- Frontend: `VITE_API_URL`, set to the deployed backend URL with `/api`
  appended (for example, `https://your-api.onrender.com/api`).

`DATABASE_URL` and `JWT_SECRET_KEY` are created by the Blueprint. Set
`CORS_ORIGINS`, `FRONTEND_URL`, and `MPESA_CALLBACK_URL` only after the
frontend/backend service URLs are known. Use `MPESA_ENVIRONMENT=live` only
with production Daraja credentials and the live shortcode/passkey. The
backend health check is available at `/health`; database migrations run before
each backend deploy.

For local and production variable descriptions, see
[backend/.env.example](backend/.env.example) and
[Frontend/.env.example](Frontend/.env.example). No seed data is deployed;
migrations preserve the Render PostgreSQL database across service restarts.

## Git Workflow

- develop - integration branch
- feature/* - feature branches merged into develop via pull requests
