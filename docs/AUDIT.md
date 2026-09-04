# Farmart Audit

## 1. Architecture Summary

- **Backend**: Flask (Python) with Flask-SQLAlchemy, Flask-Migrate (Alembic), Flask-JWT-Extended, Flask-CORS, Marshmallow schemas, Cloudinary for image storage.
- **Frontend**: React (Vite) with Redux Toolkit, React Router, Axios API client, Jest tests.
- **Structure**: `backend/app/` contains `models/`, `routes/`, `schemas/`, `services/`, `uploads/`. Frontend in `Frontend/src/` with `features/`, `pages/`, `components/`, `services/`.
- **App factory**: `create_app()` in `backend/app/__init__.py` initializes DB, JWT, CORS, registers 13 blueprints.

## 2. Current Application Flow

- User registers (BUYER or FARMER) → auto-login returns `{user, token}` → JWT used for authenticated requests.
- Farmer adds animals (with images via multipart upload).
- Buyer browses/search animals → adds to cart → creates order → pays via M-Pesa STK push (stub callback).
- Farmart Assistant provides marketplace-grounded answers (optional OpenAI).

## 3. Database / Model Relationships

- `User` (id, full_name, email, phone, password_hash, role, location) — 1:1 `Farmer`, 1:1 `Cart`
- `Farmer` (user_id FK, farm_name, farm_location, description) — 1:many `Animal`
- `AnimalType` (name unique) — 1:many `Breed`, 1:many `Animal`
- `Breed` (animal_type_id FK, name, description) — 1:many `Animal`
- `Animal` (farmer_id, animal_type_id, breed_id nullable, name, gender, age, price, description, location, status)
- `AnimalImage` (animal_id FK, image_url, is_primary)
- `Cart` (user_id FK unique) — 1:many `CartItem`
- `CartItem` (cart_id FK, animal_id FK, unique(cart_id, animal_id))
- `Order` (buyer_id FK→users, total_amount, status, delivery_address, delivery_phone) — 1:many `OrderItem`, 1:1 `Payment`, 1:1 `Delivery`
- `OrderItem` (order_id FK, animal_id FK, farmer_id FK, price, quantity)
- `Payment` (order_id FK unique, amount, payment_method, transaction_reference, status, paid_at)
- `Delivery` (order_id FK unique, delivery_address, delivery_phone, status, tracking_reference)

## 4. Authentication Flow

- JWT-based via `flask_jwt_extended`.
- `authz.py`: `@authenticated`, `@require_role("FARMER"|"BUYER")`, `current_user_id()`.
- Tokens include `role` and `email` as additional claims.
- Passwords hashed via `werkzeug.security.generate_password_hash`.

## 5. Farmer Registration Flow

- Frontend `RegisterPage.jsx` sends `role: "FARMER"`, farm_name, farm_location, farm_description.
- Backend `auth.py` register: uppercases role, loads via `UserRegisterSchema`, checks duplicate email, creates `User`, flushes, creates linked `Farmer` profile, commits, returns auto-login payload.
- Schema validates farm fields required for FARMER role.

## 6. Buyer Registration Flow

- Frontend `RegisterPage.jsx` sends `role: "BUYER"` (uppercased).
- **BUG**: Frontend always includes `farm_name: ""` and `farm_location: ""` in payload even for buyer. Backend `UserRegisterSchema` declares these fields with `validate.Length(min=2)`; Marshmallow validates present empty strings → `ValidationError` → 400 "Invalid registration data".
- No buyer profile table exists; buyer is just a `User` with role `BUYER`.

## 7. Animal Listing Flow

- Farmer adds animal via `POST /api/animals` (multipart) → `AnimalSchema` validates type/breed/gender/price → `Animal` + `AnimalImage` rows created.
- `GET /api/animals` paginated list; `GET /api/animals/search` filters by type, breed, age, price, county.
- `GET /api/animals/mine` for farmer's own listings.
- Breed must belong to selected animal type (validated).

## 8. Buyer / Order Flow

- Buyer adds to cart (`CartItem`), creates order from cart items via `POST /api/orders`.
- Cart items must be AVAILABLE; order sets animals to RESERVED.
- Order status transitions: PENDING → CONFIRMED/REJECTED/CANCELLED → COMPLETED.
- Payment created via `POST /api/payments` or M-Pesa STK push.

## 9. Payment Flow

- `Payment` model: order_id (unique), amount, payment_method, transaction_reference, status, paid_at.
- `POST /api/payments/stkpush` → `MpesaService.initiate_stk_push` → Daraja STK push.
- **GAPS**:
  - Callback route is a stub (returns 200 without processing).
  - No transaction model storing CheckoutRequestID, ResultCode, ResultDesc, ReceiptNumber.
  - No idempotency (duplicate callbacks would not be handled).
  - No payment status endpoint tied to CheckoutRequestID.
  - `mpesa_utils.py` and `services/mpesa_service.py` duplicate M-Pesa logic.
  - `mpesa_utils.py` uses `requests.get` for OAuth (correct for Daraja) but lacks error handling.

## 10. Email / Notification Flow

- `email_utils.py` exists but references a hypothetical `transaction` object with `.email`, `.name`, `.amount`, `.mpesa_receipt_number` — does not match `Payment`/`Order`/`User` models.
- `flask_mail` imported but NOT in `requirements.txt`.
- No email configuration in `.env.example` (Gmail SMTP/app-password missing).
- No email sending wired into payment/order flows.

## 11. Farmart Assistant Flow

- Frontend `FarmartAssistant.jsx`: floating launcher button + collapsible panel; included globally in `App.jsx`.
- Backend `POST /api/assistant/chat` → `assistant_service.respond()` → marketplace context query + optional OpenAI.
- Schema validates message (1–2000 chars).
- **GAPS**: no conversation persistence, no user association, no auth requirement, no rate limiting, no timeout handling, no explicit error response for OpenAI failures (silently falls back).

## 12. Search Flow

- `GET /api/animals/search` filters by animal_type_id/name, breed_id/name, min/max age, max price, county/location. Paginated. Only AVAILABLE animals returned.

## 13. File / Image Upload Flow

- Multipart upload to `POST /api/animals`; images validated (≤5, JPG/PNG/WEBP, ≤5MB) in frontend; backend stores via `image_storage_service.upload_animal_image` (Cloudinary or local `uploads/` folder fallback).
- `GET /uploads/<filename>` serves local uploads.

## 14. Environment / Configuration

- `.env.example` defines DATABASE_URL, JWT_SECRET_KEY, CORS_ORIGINS, Cloudinary keys, OPENAI_API_KEY/MODEL, MPESA_* keys.
- `.env` (untracked) contains only `DATABASE_URL=sqlite:///farmmart.db`.
- **GAPS**: No email/SMTP config; no `FLASK_MAIL_*` vars.

## 15. Existing Tests

- Backend: pytest — `conftest.py` provides app/client/farmer/buyer/session fixtures; tests exist for models, schemas, routes, services, business rules.
- Frontend: Jest — `animalsSlice`, `authSlice`, `cartSlice`, `ordersSlice` tests.
- Test DB: SQLite in-memory.

## 16. Technical Debt

- Duplicate M-Pesa logic in `mpesa_utils.py` and `services/mpesa_service.py`.
- `email_utils.py` incompatible with actual models.
- `app/__init__.py` calls `app.config.update(config)` twice.
- `routes/__init__.py` empty.
- `services/__init.py` typo (should be `__init__.py`).
- No explicit `updated_at` columns on several models.
- `Order` uses `buyer_id` FK but no direct relationship on model (only via backref).
- Unused imports (`flask_restful`, `flask_bcrypt`, `flask_mail` in requirements but not wired).

## 17. Bugs Discovered

1. **Buyer registration fails**: Frontend sends empty `farm_name`/`farm_location` strings for buyers; backend schema validates them (min length 2) → 400.
2. **M-Pesa callback is a stub**: `POST /api/payments/callback` returns success without processing the payment.
3. **No transaction model**: CheckoutRequestID not persisted → no idempotency, no status lookup.
4. **`email_utils.py` references non-existent transaction fields**.
5. **`flask_mail` missing from requirements** but imported in `email_utils.py`.

## 18. Security Concerns

- No CSRF protection on state-changing endpoints (mitigated by JWT Bearer pattern, but worth noting).
- No rate limiting on auth/assistant endpoints.
- Callback endpoint is unauthenticated (correct for Daraja) but must be validated safely.
- No explicit validation that payment callback amount matches order.
- `mpesa_utils.py` lacks timeout/error handling; errors could leak response text.

## 19. Persistence Concerns

- DATABASE_URL is SQLite file `sqlite:///farmmart.db` → persists to `backend/instance/farmmart.db`.
- This is expected development behavior. No in-memory DB in production config.

## 20. Notable Omissions

- No transaction/payment-status endpoint.
- No email configuration or sending.
- No conversation persistence for Assistant.
- No CI/CD pipeline.
- No `updated_at` columns on User/Farmer/Order/Payment.
- No tests for M-Pesa utils/service, email utils, assistant service edge cases.

## 21. Recommended Improvements

1. Add `Transaction` model (CheckoutRequestID unique, merchant request ID, result code/desc, receipt number, phone, amount, status) + migration.
2. Implement full STK push flow with callback processing and idempotency.
3. Add transaction status endpoint (authenticated, order-scoped).
4. Implement email notifications (farmer + buyer) using Gmail SMTP app password, with failure isolation.
5. Improve Assistant: conversation persistence, user association, better error handling.
6. Fix buyer registration (frontend + backend schema).
7. Expand poultry breeds in `clean_setup.py`.
8. Consolidate M-Pesa logic into a single service.
9. Add `flask_mail` to requirements; wire email config.

## 22. Risks / Blockers

- M-Pesa sandbox credentials may not be active; callback URL must be publicly reachable (ngrok/tunnel) for live testing.
- OpenAI key optional — assistant falls back gracefully.
- Gmail app password required for email sending.
- SQLite file DB is fine for dev but not production-grade concurrency.
## 20. Notable Omissions

- No transaction/payment-status endpoint.
- No email configuration or sending.
- No conversation persistence for Assistant.
- No CI/CD pipeline.
- No `updated_at` columns on User/Farmer/Order/Payment.
- No tests for M-Pesa utils/service, email utils, assistant service edge cases.

## 21. Recommended Improvements

1. Add `Transaction` model (CheckoutRequestID unique, merchant request ID, result code/desc, receipt number, phone, amount, status) + migration.
2. Implement full STK push flow with callback processing and idempotency.
3. Add transaction status endpoint (authenticated, order-scoped).
4. Implement email notifications (farmer + buyer) using Gmail SMTP app password, with failure isolation.
5. Improve Assistant: conversation persistence, user association, better error handling.
6. Fix buyer registration (frontend + backend schema).
7. Expand poultry breeds in `clean_setup.py`.
8. Consolidate M-Pesa logic into a single service.
9. Add `flask_mail` to requirements; wire email config.

## 22. Risks / Blockers

- M-Pesa sandbox credentials may not be active; callback URL must be publicly reachable (ngrok/tunnel) for live testing.
- OpenAI key optional — assistant falls back gracefully.
- Gmail app password required for email sending.
