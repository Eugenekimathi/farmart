const OrderItem = ({ order, onConfirm, onReject }) => {
  return (
    <div className="order-item">
      <div className="order-item__head">
        <div>
          <strong>Order #{order.id}</strong>
          <div className="muted">{new Date(order.created_at || order.createdAt).toLocaleString()}</div>
        </div>
        <div className={`order-status order-status--${order.status}`}>
          {order.status}
        </div>
      </div>

      <div className="order-item__body">
        {order.items && order.items.length > 0 ? (
          order.items.map((it, i) => (
            <div key={i} className="order-item__row">
              <span>{it.name || it.animal?.name || it.animal_id}</span>
              <span>KSh {Number(it.price || it.price).toLocaleString()}</span>
            </div>
          ))
        ) : (
          <div className="muted">No items</div>
        )}
      </div>

      <div className="order-item__actions">
        <button className="btn btn--outline" onClick={() => onReject(order.id)}>
          Reject
        </button>
        <button className="btn btn--primary" onClick={() => onConfirm(order.id)}>
          Confirm
        </button>
      </div>
    </div>
  )
}

export default OrderItem
