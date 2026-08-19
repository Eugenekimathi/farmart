import { useState, useEffect, useRef, startTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { placeOrder, startPayment, pollPaymentStatus, resetCheckout } from '../features/orders/ordersSlice'
import { clearCart } from '../features/cart/cartSlice'
import '../styles/checkout.css'

// Checkout has three steps
const STEPS = {
  REVIEW: 'review',
  DELIVERY: 'delivery',
  PAYMENT: 'payment',
  SUCCESS: 'success',
}

const CheckoutPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const pollRef = useRef(null)

  const { items } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.auth)
  const {
    currentOrder,
    paymentStatus,
    isLoading,
    isPaymentLoading,
    error,
    paymentError,
  } = useSelector((state) => state.orders)

  const [step, setStep] = useState(STEPS.REVIEW)

  const [deliveryForm, setDeliveryForm] = useState({
    delivery_address: user?.location || '',
    delivery_phone: user?.phone || '',
  })

  const [deliveryErrors, setDeliveryErrors] = useState({})
  const [mpesaPhone, setMpesaPhone] = useState(user?.phone || '')
  const [mpesaError, setMpesaError] = useState('')

  // Redirect to cart if no items
  useEffect(() => {
    if (items.length === 0 && step !== STEPS.SUCCESS) {
      navigate('/cart')
    }
  }, [items, step, navigate])

  // Reset checkout state on unmount
  useEffect(() => {
    return () => {
      dispatch(resetCheckout())
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [dispatch])

  // Watch payment status changes
  useEffect(() => {
    if (paymentStatus === 'paid') {
      // Payment confirmed — clear cart and show success
      dispatch(clearCart())
      startTransition(() => setStep(STEPS.SUCCESS))
      if (pollRef.current) clearInterval(pollRef.current)
    }
    if (paymentStatus === 'failed') {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [paymentStatus, dispatch])

  // Totals
  const subtotal = items.reduce((sum, item) => sum + Number(item.price), 0)
  const totalSavings = Math.round(subtotal * 0.2)

  // Step 1 → 2: move to delivery after review
  const handleReviewNext = () => {
    setStep(STEPS.DELIVERY)
  }

  // Step 2 → 3: validate delivery then create order
  const validateDelivery = () => {
    const errors = {}
    if (!deliveryForm.delivery_address.trim())
      errors.delivery_address = 'Delivery address is required'
    if (!deliveryForm.delivery_phone.trim())
      errors.delivery_phone = 'Phone number is required'
    else if (!/^(\+254|0)[17]\d{8}$/.test(deliveryForm.delivery_phone))
      errors.delivery_phone = 'Enter a valid Kenyan phone number'
    return errors
  }

  const handleDeliveryNext = async () => {
    const errors = validateDelivery()
    if (Object.keys(errors).length > 0) {
      setDeliveryErrors(errors)
      return
    }
    // Create the order on the backend
    const result = await dispatch(
      placeOrder({
        ...deliveryForm,
        items: items.map((item) => ({
          animal_id: item.id,
          farmer_id: item.farmer_id,
          price: item.price,
        })),
      })
    )
    if (result.meta.requestStatus === 'fulfilled') {
      setStep(STEPS.PAYMENT)
    }
  }

  // Step 3: trigger M-Pesa STK push
  const validateMpesa = () => {
    if (!mpesaPhone.trim()) return 'Phone number is required'
    if (!/^(\+254|0)[17]\d{8}$/.test(mpesaPhone))
      return 'Enter a valid M-Pesa number'
    return ''
  }

  const handlePayment = async () => {
    const err = validateMpesa()
    if (err) {
      setMpesaError(err)
      return
    }
    const result = await dispatch(
      startPayment({
        order_id: currentOrder.id,
        phone_number: mpesaPhone,
        amount: subtotal,
      })
    )
    if (result.meta.requestStatus === 'fulfilled') {
      // Start polling every 5 seconds to check if user confirmed on phone
      pollRef.current = setInterval(() => {
        dispatch(pollPaymentStatus(currentOrder.id))
      }, 5000)
    }
  }

  // ── STEP: SUCCESS ──────────────────────────────────────────
  if (step === STEPS.SUCCESS) {
    return (
      <div className="checkout-success">
        <div className="checkout-success__icon">✅</div>
        <h2 className="checkout-success__title">Order Placed!</h2>
        <p className="checkout-success__subtitle">
          Payment confirmed via M-Pesa. The farmer will be notified
          and will confirm your order shortly.
        </p>
        {currentOrder && (
          <p className="checkout-success__ref">
            Order #{currentOrder.id}
          </p>
        )}
        <div className="checkout-success__actions">
          <button
            className="btn btn--primary"
            onClick={() => navigate('/store')}
          >
            Continue Shopping
          </button>
          <button
            className="btn btn--outline"
            onClick={() => navigate('/orders')}
          >
            View My Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">

      {/* Step indicator */}
      <div className="checkout-steps">
        {['Review', 'Delivery', 'Payment'].map((label, index) => {
          const stepKeys = [STEPS.REVIEW, STEPS.DELIVERY, STEPS.PAYMENT]
          const isActive = step === stepKeys[index]
          const isDone =
            stepKeys.indexOf(step) > index

          return (
            <div
              key={label}
              className={`checkout-step ${isActive ? 'checkout-step--active' : ''} ${isDone ? 'checkout-step--done' : ''}`}
            >
              <div className="checkout-step__circle">
                {isDone ? '✓' : index + 1}
              </div>
              <span className="checkout-step__label">{label}</span>
            </div>
          )
        })}
      </div>

      <div className="checkout-page__body">

        {/* Left panel — step content */}
        <div className="checkout-panel">

          {/* ── STEP 1: REVIEW ── */}
          {step === STEPS.REVIEW && (
            <div>
              <h2 className="checkout-panel__title">Review Your Order</h2>

              <div className="checkout-review-items">
                {items.map((item) => {
                  const img =
                    item.images?.find((i) => i.is_primary) ||
                    item.images?.[0]
                  return (
                    <div key={item.id} className="checkout-review-item">
                      <div className="checkout-review-item__img-wrap">
                        {img ? (
                          <img src={img.image_url} alt={item.name} />
                        ) : (
                          <span>🐄</span>
                        )}
                      </div>
                      <div className="checkout-review-item__info">
                        <p className="checkout-review-item__name">
                          {item.name}
                        </p>
                        <p className="checkout-review-item__meta">
                          📍 {item.location} · {item.age} months
                        </p>
                        <p className="checkout-review-item__farmer">
                          🌾 {item.farmer?.farm_name || 'Verified Farmer'}
                        </p>
                      </div>
                      <p className="checkout-review-item__price">
                        KSh {Number(item.price).toLocaleString()}
                      </p>
                    </div>
                  )
                })}
              </div>

              <button
                className="btn btn--primary btn--full"
                onClick={handleReviewNext}
                style={{ marginTop: '1.5rem' }}
              >
                Continue to Delivery →
              </button>
            </div>
          )}

          {/* ── STEP 2: DELIVERY ── */}
          {step === STEPS.DELIVERY && (
            <div>
              <h2 className="checkout-panel__title">Delivery Details</h2>
              <p className="checkout-panel__subtitle">
                Where should the farmer deliver your animals?
              </p>

              {error && (
                <div className="checkout-error">{error}</div>
              )}

              <div className="checkout-form">
                <div className="form-group">
                  <label className="form-label">Delivery Address</label>
                  <input
                    type="text"
                    value={deliveryForm.delivery_address}
                    onChange={(e) => {
                      setDeliveryForm((p) => ({
                        ...p,
                        delivery_address: e.target.value,
                      }))
                      if (deliveryErrors.delivery_address)
                        setDeliveryErrors((p) => ({
                          ...p,
                          delivery_address: '',
                        }))
                    }}
                    placeholder="e.g. Nakuru Town, near Stage"
                    className={`form-input ${deliveryErrors.delivery_address ? 'form-input--error' : ''}`}
                  />
                  {deliveryErrors.delivery_address && (
                    <span className="form-error">
                      {deliveryErrors.delivery_address}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Contact Phone for Delivery
                  </label>
                  <input
                    type="tel"
                    value={deliveryForm.delivery_phone}
                    onChange={(e) => {
                      setDeliveryForm((p) => ({
                        ...p,
                        delivery_phone: e.target.value,
                      }))
                      if (deliveryErrors.delivery_phone)
                        setDeliveryErrors((p) => ({
                          ...p,
                          delivery_phone: '',
                        }))
                    }}
                    placeholder="0712345678"
                    className={`form-input ${deliveryErrors.delivery_phone ? 'form-input--error' : ''}`}
                  />
                  {deliveryErrors.delivery_phone && (
                    <span className="form-error">
                      {deliveryErrors.delivery_phone}
                    </span>
                  )}
                </div>

                <div className="checkout-form__actions">
                  <button
                    className="btn btn--outline"
                    onClick={() => setStep(STEPS.REVIEW)}
                  >
                    ← Back
                  </button>
                  <button
                    className="btn btn--primary"
                    onClick={handleDeliveryNext}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Continue to Payment →'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: PAYMENT ── */}
          {step === STEPS.PAYMENT && (
            <div>
              <h2 className="checkout-panel__title">Pay via M-Pesa</h2>
              <p className="checkout-panel__subtitle">
                Enter your M-Pesa number. You will receive a payment
                prompt on your phone.
              </p>

              {paymentError && (
                <div className="checkout-error">{paymentError}</div>
              )}

              <div className="mpesa-box">
                <div className="mpesa-box__header">
                  <span className="mpesa-box__logo">M-PESA</span>
                  <span className="mpesa-box__amount">
                    KSh {subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">M-Pesa Phone Number</label>
                  <input
                    type="tel"
                    value={mpesaPhone}
                    onChange={(e) => {
                      setMpesaPhone(e.target.value)
                      setMpesaError('')
                    }}
                    placeholder="0712345678"
                    className={`form-input ${mpesaError ? 'form-input--error' : ''}`}
                    disabled={
                      paymentStatus === 'stk_sent' || isPaymentLoading
                    }
                  />
                  {mpesaError && (
                    <span className="form-error">{mpesaError}</span>
                  )}
                </div>

                {/* STK push sent — waiting for user to confirm */}
                {paymentStatus === 'stk_sent' && (
                  <div className="mpesa-waiting">
                    <div className="spinner" />
                    <div>
                      <p className="mpesa-waiting__title">
                        Check your phone!
                      </p>
                      <p className="mpesa-waiting__sub">
                        A payment prompt has been sent to{' '}
                        <strong>{mpesaPhone}</strong>. Enter your
                        M-Pesa PIN to complete the payment.
                      </p>
                    </div>
                  </div>
                )}

                {paymentStatus === 'failed' && (
                  <div className="checkout-error" style={{ marginTop: '1rem' }}>
                    Payment failed or timed out. Please try again.
                  </div>
                )}

                <div className="checkout-form__actions" style={{ marginTop: '1.25rem' }}>
                  <button
                    className="btn btn--outline"
                    onClick={() => setStep(STEPS.DELIVERY)}
                    disabled={
                      paymentStatus === 'stk_sent' || isPaymentLoading
                    }
                  >
                    ← Back
                  </button>
                  <button
                    className="btn btn--primary"
                    onClick={handlePayment}
                    disabled={
                      isPaymentLoading ||
                      paymentStatus === 'stk_sent'
                    }
                  >
                    {isPaymentLoading
                      ? 'Sending prompt...'
                      : paymentStatus === 'stk_sent'
                      ? 'Waiting for confirmation...'
                      : 'Send M-Pesa Prompt'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right panel — order summary (persists across steps) */}
        <div className="checkout-summary">
          <h3 className="checkout-summary__title">Order Summary</h3>

          <div className="checkout-summary__items">
            {items.map((item) => (
              <div key={item.id} className="checkout-summary__item">
                <span className="checkout-summary__item-name">
                  {item.name}
                </span>
                <span className="checkout-summary__item-price">
                  KSh {Number(item.price).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="checkout-summary__divider" />

          <div className="checkout-summary__row">
            <span>Subtotal</span>
            <span>KSh {subtotal.toLocaleString()}</span>
          </div>
          <div className="checkout-summary__row checkout-summary__row--savings">
            <span>💚 Broker savings</span>
            <span>- KSh {totalSavings.toLocaleString()}</span>
          </div>

          <div className="checkout-summary__divider" />

          <div className="checkout-summary__total">
            <span>Total</span>
            <span>KSh {subtotal.toLocaleString()}</span>
          </div>
        </div>

      </div>
    </div>
  )
}

export default CheckoutPage
