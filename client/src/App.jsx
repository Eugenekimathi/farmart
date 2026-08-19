import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import { getCart } from './features/cart/cartSlice'

import HomePage from './pages/HomePage'
import StorePage from './pages/StorePage'
import AnimalDetailPage from './pages/AnimalDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FarmerPortalPage from './pages/FarmerPortalPage'
import AddAnimalPage from './pages/AddAnimalPage'
import EditAnimalPage from './pages/EditAnimalPage'
import NotFoundPage from './pages/NotFoundPage'

const App = () => {
  const dispatch = useDispatch()
  const { user, role } = useSelector((state) => state.auth)

  // Load cart from backend whenever user logs in
  useEffect(() => {
    if (user && role !== 'farmer') {
      dispatch(getCart())
    }
  }, [user, role, dispatch])

  return (
    <BrowserRouter>
      {/* Navbar renders on every page */}
      <Navbar />

      <main className="main-content">
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/store/:id" element={<AnimalDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/farmer-portal"
          element={
            <ProtectedRoute role="farmer">
              <FarmerPortalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer-portal/add-animal"
          element={
            <ProtectedRoute role="farmer">
              <AddAnimalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer-portal/edit-animal/:id"
          element={
            <ProtectedRoute role="farmer">
              <EditAnimalPage />
            </ProtectedRoute>
          }
        />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
