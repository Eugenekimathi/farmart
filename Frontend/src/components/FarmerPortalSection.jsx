import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { confirmLocalOrder, rejectLocalOrder } from '../features/orders/ordersSlice'

const FarmerPortalSection = () => {
  const dispatch = useDispatch()
  const { farmerOrders } = useSelector((state) => state.orders)
  const { animals } = useSelector((state) => state.animals)

  const handleConfirm = (id) => {
    dispatch(confirmLocalOrder(id))
  }

  const handleReject = (id) => {
    dispatch(rejectLocalOrder(id))
  }

  return (
    <section className="wireframe-farmer-section">
      <div className="wireframe-farmer-section__header">
        <div className="wireframe-farmer-section__title-group">
          <span className="wireframe-icon-badge">[⚙️]</span>
          <h2 className="wireframe-farmer-section__title">Farmer Portal</h2>
        </div>
        <span className="wireframe-tag-badge">// FARMER PORTAL</span>
      </div>

      <div className="wireframe-farmer-section__grid">
        {/* Left Box: My Active Listings */}
        <div className="wireframe-portal-card">
          <h3 className="wireframe-portal-card__title">My Active Listings</h3>
          <div className="wireframe-table-wrapper">
            <table className="wireframe-table">
              <thead>
                <tr>
                  <th>ANIMAL</th>
                  <th>BREED</th>
                  <th>WEIGHT</th>
                  <th>PRICE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {animals.map((item) => (
                  <tr key={item.id}>
                    <td className="font-bold">{item.name}</td>
                    <td>{item.breed?.name}</td>
                    <td>{item.weight}</td>
                    <td className="font-mono">KSh {Number(item.price).toLocaleString()}</td>
                    <td>
                      <div className="wireframe-action-btns">
                        <span className="wireframe-status-pill wireframe-status-pill--listed">Listed</span>
                        <Link to={`/farmer-portal/edit-animal/${item.id}`} className="wireframe-btn-action wireframe-btn-action--reject">Edit</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Box: Incoming Orders */}
        <div className="wireframe-portal-card">
          <h3 className="wireframe-portal-card__title">Incoming Orders</h3>
          <div className="wireframe-table-wrapper">
            <table className="wireframe-table">
              <thead>
                <tr>
                  <th>BUYER</th>
                  <th>ANIMAL</th>
                  <th>AMOUNT</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {farmerOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium">{order.buyer}</td>
                    <td>{order.animal}</td>
                    <td className="font-mono">{order.amount}</td>
                    <td>
                      {order.status === 'confirmed' ? (
                        <span className="wireframe-status-pill wireframe-status-pill--listed">
                          ✓ Confirmed
                        </span>
                      ) : order.status === 'rejected' ? (
                        <span className="wireframe-status-pill wireframe-status-pill--rejected">
                          ✕ Rejected
                        </span>
                      ) : (
                        <div className="wireframe-action-btns">
                          <button
                            className="wireframe-btn-action wireframe-btn-action--confirm"
                            onClick={() => handleConfirm(order.id)}
                          >
                            [✓ Confirm]
                          </button>
                          <button
                            className="wireframe-btn-action wireframe-btn-action--reject"
                            onClick={() => handleReject(order.id)}
                          >
                            [✕ Reject]
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FarmerPortalSection
