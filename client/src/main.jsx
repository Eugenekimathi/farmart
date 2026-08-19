import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import App from './App.jsx'
import Home from './pages/Home'
import AnimalsList from './pages/AnimalsList'
import AnimalDetail from './pages/AnimalDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import FarmerPortal from './pages/FarmerPortal'
import AddEditAnimal from './pages/AddEditAnimal'
import store from './app/store'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="animals" element={<AnimalsList />} />
            <Route path="animals/:id" element={<AnimalDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="farmer" element={<FarmerPortal />} />
            <Route path="farmer/add" element={<AddEditAnimal />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
