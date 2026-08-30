import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getFarmerAnimals, removeFarmerAnimal } from '../features/farmer/farmerSlice'
import { getFarmerOrders, confirmFarmerOrder, rejectFarmerOrder } from '../features/orders/ordersSlice'
import '../styles/farmerPortal.css'

const FarmerPortalPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { listings, isLoading: listingsLoading, error: listingsError } =
    useSelector((state) => state.farmer)
  const {
    farmerOrders,
    isFarmerOrdersLoading,
    error: ordersError,
  } = useSelector((state) => state.orders)
  const { user } = useSelector((state) => state.auth)

  // Track which order is being actioned to show loading on that row
  const [actioningOrderId, setActioningOrderId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  useEffect(() => {
    dispatch(getFarmerAnimals())
    dispatch(getFarmerOrders())
  }, [dispatch])

  const handleDelete = async (id) => {
    if (deleteConfirmId !== id) {
      // First click â€” ask for confirmation
      setDeleteConfirmId(id)
      return
    }
    // Second click â€” confirmed
    setDeletingId(id)
    setDeleteConfirmId(null)
    await dispatch(removeFarmerAnimal(id))
    setDeletingId(null)
  }

  const handleConfirm = async (orderId) => {
    setActioningOrderId(orderId)
    await dispatch(confirmFarmerOrder(orderId))
    setActioningOrderId(null)
  }

  const handleReject = async (orderId) => {
    setActioningOrderId(orderId)
    await dispatch(rejectFarmerOrder(orderId))
    setActioningOrderId(null)
  }

  const getStatusBadge = (status) => {
    const map = {
      available: { label: 'Listed', cls: 'badge--green' },
      pending: { label: 'Pending', cls: 'badge--yellow' },
      sold: { label: 'Sold', cls: 'badge--gray' },
      confirmed: { label: 'Confirmed', cls: 'badge--green' },
      rejected: { label: 'Rejected', cls: 'badge--red' },
      paid: { label: 'Paid', cls: 'badge--blue' },
    }
    return map[status] || { label: status, cls: 'badge--gray' }
  }

  return (
    <div className="farmer-portal">

      {/* Portal header */}
      <div className="farmer-portal__header">
        <div className="farmer-portal__header-inner">
          <p className="farmer-portal__tag">// FARMER PORTAL</p>
          <h1 className="farmer-portal__title">
            ðŸŒ¾ Farmer Portal
          </h1>
          <p className="farmer-portal__subtitle">
            Welcome back, {user?.full_name?.split(' ')[0] || user?.username || 'Farmer'}. Manage your
            listings and orders from here.
          </p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => navigate('/farmer-portal/add-animal')}
        >
          + Add New Animal
        </button>
      </div>

      <section className="farmer-portal__stats" aria-label="Farm summary">
        <div className="portal-stat"><span className="portal-stat__label">Active listings</span><strong className="portal-stat__value">{listings.length}</strong><span className="portal-stat__change">Available now</span></div>
        <div className="portal-stat"><span className="portal-stat__label">Incoming orders</span><strong className="portal-stat__value">{farmerOrders.length}</strong><span className="portal-stat__change">Manage requests</span></div>
        <div className="portal-stat"><span className="portal-stat__label">Sold listings</span><strong className="portal-stat__value">{listings.filter((animal) => animal.status === 'sold').length}</strong><span className="portal-stat__change">Completed sales</span></div>
        <div className="portal-stat"><span className="portal-stat__label">Pending orders</span><strong className="portal-stat__value">{farmerOrders.filter((order) => order.status === 'pending' || order.status === 'paid').length}</strong><span className="portal-stat__change">Awaiting action</span></div>
      </section>

      <div className="farmer-portal__body">

        {/* â”€â”€ My Active Listings â”€â”€ */}
        <section className="portal-section">
          <div className="portal-section__header">
            <h2 className="portal-section__title">My Active Listings</h2>
            <span className="portal-section__tag">// LISTINGS</span>
          </div>

          {listingsError && (
            <div className="portal-error">{listingsError}</div>
          )}

          {listingsLoading ? (
            <div className="portal-loading">
              <div className="spinner" />
            </div>
          ) : listings.length === 0 ? (
            <div className="portal-empty">
              <p>You have no listings yet.</p>
              <button
                className="btn btn--primary"
                onClick={() => navigate('/farmer-portal/add-animal')}
              >
                Add Your First Animal
              </button>
            </div>
          ) : (
            <div className="portal-table-wrap">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Animal</th>
                    <th>Breed</th>
                    <th>Age</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((animal) => {
                    const badge = getStatusBadge(animal.status)
                    return (
                      <tr key={animal.id}>
                        <td className="portal-table__name" data-label="Animal">
                          {animal.name}
                        </td>
                        <td>{animal.breed?.name || 'â€”'}</td>
                        <td data-label="Age">{animal.age} mo</td>
                        <td className="portal-table__price" data-label="Price">
                          KSh {Number(animal.price).toLocaleString()}
                        </td>
                        <td>
                          <span className={`badge ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td>
                          <div className="portal-table__actions">
                            <button
                              className="portal-action-btn portal-action-btn--edit"
                              onClick={() =>
                                navigate(
                                  `/farmer-portal/edit-animal/${animal.id}`
                                )
                              }
                            >
                              Edit
                            </button>
                            <button
                              className={`portal-action-btn ${deleteConfirmId === animal.id ? 'portal-action-btn--confirm' : 'portal-action-btn--delete'}`}
                              onClick={() => handleDelete(animal.id)}
                              disabled={deletingId === animal.id}
                            >
                              {deletingId === animal.id
                                ? 'Deleting...'
                                : deleteConfirmId === animal.id
                                ? 'Sure?'
                                : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* â”€â”€ Incoming Orders â”€â”€ */}
        <section className="portal-section">
          <div className="portal-section__header">
            <h2 className="portal-section__title">Incoming Orders</h2>
            <span className="portal-section__tag">// ORDERS</span>
          </div>

          {ordersError && (
            <div className="portal-error">{ordersError}</div>
          )}

          {isFarmerOrdersLoading ? (
            <div className="portal-loading">
              <div className="spinner" />
            </div>
          ) : farmerOrders.length === 0 ? (
            <div className="portal-empty">
              <p>No incoming orders yet.</p>
              <p>Orders will appear here once buyers purchase your animals.</p>
            </div>
          ) : (
            <div className="portal-table-wrap">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Buyer</th>
                    <th>Animal</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {farmerOrders.map((order) => {
                    const badge = getStatusBadge(order.status)
                    const isActioning = actioningOrderId === order.id
                    const isPending = order.status === 'pending' || order.status === 'paid'

                    return (
                      <tr key={order.id}>
                        <td>
                          <div className="portal-table__buyer">
                            <span className="portal-table__buyer-name">
                              {order.buyer?.full_name || order.buyer || 'Unknown'}
                            </span>
                            <span className="portal-table__buyer-phone">
                              {order.buyer?.phone}
                            </span>
                          </div>
                        </td>
                        <td>
                          {order.order_items?.map((item) => (
                            <div key={item.id} className="portal-table__animal">
                              {item.animal?.name}
                            </div>
                          )) || <div className="portal-table__animal">{order.animal}</div>}
                        </td>
                        <td className="portal-table__price" data-label="Price">
                          KSh {Number(order.total_amount || order.amount || 0).toLocaleString()}
                        </td>
                        <td>
                          <span className={`badge ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td>
                          {isPending ? (
                            <div className="portal-table__actions">
                              <button
                                className="portal-action-btn portal-action-btn--confirm"
                                onClick={() => handleConfirm(order.id)}
                                disabled={isActioning}
                              >
                                {isActioning ? '...' : 'âœ“ Confirm'}
                              </button>
                              <button
                                className="portal-action-btn portal-action-btn--delete"
                                onClick={() => handleReject(order.id)}
                                disabled={isActioning}
                              >
                                {isActioning ? '...' : 'âœ— Reject'}
                              </button>
                            </div>
                          ) : (
                            <span className="portal-table__actioned">
                              {order.status === 'confirmed' && 'âœ“ Confirmed'}
                              {order.status === 'rejected' && 'âœ— Rejected'}
                              {order.status === 'completed' && 'âœ“ Completed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}

export default FarmerPortalPage

