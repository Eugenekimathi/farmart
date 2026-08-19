import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMyOrders } from '../features/orders/ordersSlice'
import '../styles/orders.css'

const formatPrice = (value) => `KSh ${Number(value || 0).toLocaleString()}`

const OrdersPage = () => {
  const dispatch = useDispatch()
  const { orders, isLoading, error } = useSelector((state) => state.orders)

  useEffect(() => {
    dispatch(getMyOrders())
  }, [dispatch])

  if (isLoading) {
    return <div className="orders-page orders-page--state" role="status"><div className="spinner" /><p>Loading your orders...</p></div>
  }

  if (error) {
    return <div className="orders-page orders-page--state"><h1>Orders</h1><p className="orders-page__error" role="alert">{error}</p><button className="btn btn--primary" onClick={() => dispatch(getMyOrders())}>Try again</button></div>
  }

  return (
    <div className="orders-page">
      <header className="orders-page__header">
        <div>
          <p className="orders-page__eyebrow">// PURCHASE HISTORY</p>
          <h1>My Orders</h1>
          <p>Track your livestock purchases and payment status.</p>
        </div>
        <span className="orders-page__count">{orders.length} order{orders.length === 1 ? '' : 's'}</span>
      </header>
      {orders.length === 0 ? (
        <div className="orders-page__empty"><span className="orders-page__empty-icon" aria-hidden="true">🧾</span><h2>No orders yet</h2><p>Your completed purchases will appear here.</p></div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-card__topline"><div><p className="order-card__label">Order reference</p><h2>#{order.id}</h2></div><span className={`order-card__status order-card__status--${order.status || 'pending'}`}>{order.status || 'pending'}</span></div>
              <div className="order-card__details"><span>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Recently placed'}</span><strong>{formatPrice(order.total_amount || order.total)}</strong></div>
              {order.delivery_address && <p className="order-card__delivery">Delivery: {order.delivery_address}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage
