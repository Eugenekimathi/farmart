# Farmart Frontend

The buyer and farmer web application for Farmart Kenya. This folder is independent from the backend service in `../Backend`.

## Local development

```bash
npm install
npm run dev
```

The frontend uses `VITE_API_URL` when provided and otherwise calls the local API at `http://localhost:5000/api`.

## Quality checks

```bash
npm run lint
npm run build
```

The frontend includes store browsing, animal details, cart, M-Pesa checkout, buyer orders, authentication, and farmer portal views.
