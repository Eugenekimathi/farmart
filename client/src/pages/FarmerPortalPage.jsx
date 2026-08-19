import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFarmerOrders, confirmOrder, rejectOrder } from '../features/orders/ordersSlice'
import OrderItem from './components/OrderItem'
import '../styles/farmerPortal.css'

const FarmerPortalPage = () => {
  const dispatch = useDispatch()
  const { farmerOrders, isLoading } = useSelector((state) => state.orders)

  useEffect(() => {
    dispatch(fetchFarmerOrders())
  }, [dispatch])

  const handleConfirm = (id) => {
    dispatch(confirmOrder(id))
  }
  const handleReject = (id) => {
    dispatch(rejectOrder(id))
  }

  return (
    <div className="farmer-portal">
      <h1>Farmer Portal</h1>
      <p className="muted">Manage listings and orders</p>

      <section className="orders-section">
        <h2>Incoming Orders</h2>
        {isLoading && <div>Loading...</div>}
        {!isLoading && farmerOrders.length === 0 && (
          <div className="muted">No orders yet</div>
        )}
        <div className="orders-list">
          {farmerOrders.map((o) => (
            <OrderItem key={o.id} order={o} onConfirm={handleConfirm} onReject={handleReject} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default FarmerPortalPage
const FarmerPortalPage = () => {
  return <div>Farmer Portal Page</div>
}

export default FarmerPortalPage
