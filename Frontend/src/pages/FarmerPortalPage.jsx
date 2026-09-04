import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getFarmerAnimals, removeFarmerAnimal } from '../features/farmer/farmerSlice'
import { getFarmerOrders, confirmFarmerOrder, rejectFarmerOrder } from '../features/orders/ordersSlice'
import '../styles/farmerPortal.css'

// SVG Icons
const PlusIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
)

const EditIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
)

const TrashIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
)

const CheckIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const XIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

const UserIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const PhoneIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

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
      // First click  ask for confirmation
      setDeleteConfirmId(id)
      return
    }
    // Second click  confirmed
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
        <div>
          <p className="farmer-portal__tag">FARMER PORTAL</p>
          <h1 className="farmer-portal__title">
            Manage Your Farm
          </h1>
          <p className="farmer-portal__subtitle">
            Welcome back, {user?.full_name?.split(' ')[0] || user?.username || 'Farmer'}. Manage your
            listings and orders from here.
          </p>
        </div>
        <button
          className="btn btn--accent btn--lg"
          onClick={() => navigate('/farmer-portal/add-animal')}
        >
          <PlusIcon />
          Add New Animal
        </button>
      </div>

      <section className="farmer-portal__stats" aria-label="Farm summary">
        <div className="portal-stat">
          <span className="portal-stat__label">Active listings</span>
          <strong className="portal-stat__value">{listings.length}</strong>
          <span className="portal-stat__change">Available now</span>
        </div>
        <div className="portal-stat">
          <span className="portal-stat__label">Incoming orders</span>
          <strong className="portal-stat__value">{farmerOrders.length}</strong>
          <span className="portal-stat__change">Manage requests</span>
        </div>
        <div className="portal-stat">
          <span className="portal-stat__label">Sold listings</span>
          <strong className="portal-stat__value">{listings.filter((animal) => animal.status === 'sold').length}</strong>
          <span className="portal-stat__change">Completed sales</span>
        </div>
        <div className="portal-stat">
          <span className="portal-stat__label">Pending orders</span>
          <strong className="portal-stat__value">{farmerOrders.filter((order) => order.status === 'pending' || order.status === 'paid').length}</strong>
          <span className="portal-stat__change">Awaiting action</span>
        </div>
      </section>

      <div className="farmer-portal__body">

        {/*  My Active Listings  */}
        <section className="portal-section">
          <div className="portal-section__header">
            <h2 className="portal-section__title">My Active Listings</h2>
            <span className="portal-section__tag">LISTINGS</span>
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
                        <td>{animal.breed?.name || ''}</td>
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
                              <EditIcon />
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
                                : (
                                  <>
                                    <TrashIcon />
                                    Delete
                                  </>
                                )}
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

        {/*  Incoming Orders  */}
        <section className="portal-section">
          <div className="portal-section__header">
            <h2 className="portal-section__title">Incoming Orders</h2>
            <span className="portal-section__tag">ORDERS</span>
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
                              <PhoneIcon />
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
                                {isActioning ? (
                                  '...'
                                ) : (
                                  <>
                                    <CheckIcon />
                                    Confirm
                                  </>
                                )}
                              </button>
                              <button
                                className="portal-action-btn portal-action-btn--delete"
                                onClick={() => handleReject(order.id)}
                                disabled={isActioning}
                              >
                                {isActioning ? (
                                  '...'
                                ) : (
                                  <>
                                    <XIcon />
                                    Reject
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="portal-table__actioned">
                              {order.status === 'confirmed' && 'Confirmed'}
                              {order.status === 'rejected' && 'Rejected'}
                              {order.status === 'completed' && 'Completed'}
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
