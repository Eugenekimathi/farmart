import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMyOrders } from '../features/orders/ordersSlice'
import '../styles/orders.css'

const formatPrice = (value) => `KSh ${Number(value || 0).toLocaleString()}`
const formatStatus = (status) => (status || 'PENDING').replaceAll('_', ' ')
const primaryImage = (animal) => animal?.images?.find((image) => image.is_primary)?.image_url || animal?.images?.[0]?.image_url

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
              <div className="order-card__topline"><div><p className="order-card__label">Order reference</p><h2>#{order.id}</h2><p className="order-card__date">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Recently placed'}</p></div><span className={`order-card__status order-card__status--${(order.status || 'pending').toLowerCase()}`}>{formatStatus(order.status)}</span></div>
              <div className="order-card__items">
                {order.order_items?.length ? order.order_items.map((item) => (
                  <div className="order-card__item" key={item.id}>
                    <div className="order-card__image">{primaryImage(item.animal) ? <img src={primaryImage(item.animal)} alt="" /> : '🐄'}</div>
                    <div><strong>{item.animal?.name || `Animal #${item.animal_id}`}</strong><span>{item.farmer?.farm_name || 'Farmart farmer'} · {item.farmer?.farm_location || item.animal?.location}</span></div>
                    <span>Qty {item.quantity}</span><strong>{formatPrice(item.price)}</strong>
                  </div>
                )) : <p className="order-card__muted">Listing details are being prepared.</p>}
              </div>
              <div className="order-card__footer"><span>Delivery: {order.delivery_address || 'Address pending'}</span><strong>Total {formatPrice(order.total_amount || order.total)}</strong></div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage
