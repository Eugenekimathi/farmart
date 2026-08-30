# Farmart Kenya — Backend
Flask REST API for the Farmart Kenya livestock e-commerce platform.

## Tech Stack
- Python Flask, SQLAlchemy and Marshmallow
- Flask-JWT-Extended for authentication and authorization
- Flask-CORS for the Vite frontend
- Flask-Migrate for database migrations
- PostgreSQL in production and SQLite for local testing
## Setup
```powershell
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
Copy-Item .env.example .env
# Edit .env with your local values
flask db upgrade
python run.py
```

The API runs at `http://localhost:5000/api`.

## Environment Variables
See `.env.example`:

- `DATABASE_URL` — database connection string
- `JWT_SECRET_KEY` — secret used to sign JWTs
- `CORS_ORIGINS` — comma-separated frontend origins
- `MPESA_CONSUMER_KEY` — M-Pesa API consumer key (optional)
- `MPESA_CONSUMER_SECRET` — M-Pesa API consumer secret (optional)
- `MPESA_PASSKEY` — M-Pesa passkey for STK Push (optional)
- `MPESA_SHORTCODE` — M-Pesa business shortcode (optional)
- `MPESA_ENVIRONMENT` — M-Pesa environment: sandbox or live (optional)
- `MPESA_CALLBACK_URL` — M-Pesa callback URL (optional)
## Authentication
| Method | URL | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a buyer or farmer and receive a JWT |
| POST | `/api/auth/login` | Authenticate and receive a JWT |

Send the token on protected requests using:

```text
Authorization: Bearer <token>
```

## Main API Resources
- `/api/animals` — browse and manage livestock
- `/api/animal-types` and `/api/breeds` — catalog data
- `/api/carts` — buyer carts and cart items
- `/api/orders` — orders, order items and status updates
- `/api/payments` — payment records and statuses
- `/api/deliveries` — delivery records and statuses
- `/api/farmers` — farmer profiles
- `/api/animals/<id>/images` — animal images
## Tests
```powershell
python -m pytest -q
```

The test suite uses an isolated in-memory SQLite database.

## Database Seeding
This application does not use seed data. All marketplace data should be created through the application:
1. Register as a farmer
2. Create farmer profile
3. Add animals with real images
4. Buyers can then browse and purchase real listings

## M-Pesa Payment Integration
The application includes M-Pesa STK Push payment integration. To enable:

1. Get M-Pesa API credentials from Safaricom Developer Portal
2. Add the following to your `.env` file:
   ```
   MPESA_CONSUMER_KEY=your-consumer-key
   MPESA_CONSUMER_SECRET=your-consumer-secret
   MPESA_PASSKEY=your-passkey
   MPESA_SHORTCODE=your-shortcode
   MPESA_ENVIRONMENT=sandbox
   MPESA_CALLBACK_URL=http://localhost:5000/api/payments/callback
   ```
3. Install the requests library: `pip install requests`
4. Use the `/api/payments/stkpush` endpoint to initiate payments

Note: Without M-Pesa credentials, the application will use a manual payment recording system where users can record payments manually.
