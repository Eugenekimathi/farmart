# Farmart Kenya — Frontend

React + Redux Toolkit frontend for the Farmart Kenya livestock e-commerce platform.

## About

Farmart Kenya eliminates middlemen between livestock farmers and buyers. Farmers list animals for sale, buyers browse and purchase directly via M-Pesa.

## Tech Stack

| Tool | Purpose |
|---|---|
| React 19 | UI framework |
| Redux Toolkit | Global state management |
| React Router v7 | Client-side routing |
| Axios | HTTP requests to backend |
| Vite | Build tool and dev server |
| Jest | Unit testing |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Backend API running (or mock server)

### Installation

```bash
# Clone the repo
git clone https://github.com/Eugenekimathi/farmart.git
cd farmart/Frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and set VITE_API_URL to your backend URL

# Start development server
npm run dev
```

App runs at `http://localhost:5173`

### Environment Variables

Create a `.env` file in the `Frontend/` directory:

```
VITE_API_URL=http://localhost:5000/api
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
npm test         # Run Jest unit tests
```

## Project Structure

```
Frontend/src/
├── app/             # Redux store configuration
├── components/      # Reusable UI components
│   ├── Navbar.jsx
│   ├── AnimalCard.jsx
│   ├── AnimalForm.jsx
│   ├── FilterSidebar.jsx
│   ├── Pagination.jsx
│   └── ProtectedRoute.jsx
├── features/        # Redux slices
│   ├── auth/        # Login, register, user session
│   ├── animals/     # Listings, search, filters
│   ├── cart/        # Shopping cart
│   ├── farmer/      # Farmer listings management
│   └── orders/      # Orders and payments
├── pages/           # Route-level page components
├── services/        # Axios API call functions
├── styles/          # Global and component CSS
└── __tests__/       # Jest unit tests
```

## Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home page |
| `/store` | Public | Browse all animals |
| `/store/:id` | Public | Animal detail page |
| `/login` | Public | Login |
| `/register` | Public | Register as buyer or farmer |
| `/cart` | Buyer | Shopping cart |
| `/checkout` | Buyer | 3-step checkout with M-Pesa |
| `/farmer-portal` | Farmer | Manage listings and orders |
| `/farmer-portal/add-animal` | Farmer | Add new animal listing |
| `/farmer-portal/edit-animal/:id` | Farmer | Edit existing listing |

## CI/CD

GitHub Actions runs on every PR:
1. Install dependencies
2. Run Jest tests
3. Build for production

Deployment to Vercel triggers automatically on merge to `main`.

