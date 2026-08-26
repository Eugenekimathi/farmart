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
