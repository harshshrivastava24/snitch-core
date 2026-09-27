import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../cart/hooks/useCart'
import { useOrders } from '../hooks/useOrders'
import { ShieldCheck, Truck, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth'
import { orderApi } from '../api/orderApi'
import { loadRazorpayScript } from '../../../utils/loadRazorpay'

export const CheckoutForm = () => {
  const navigate = useNavigate()
  const { items, totalPrice, itemCount } = useCart()
  const { checkout, isLoading, error, clearError } = useOrders()

  const [address, setAddress] = useState({
    house: '',
    street: '',
    city: '',
    state: '',
    zip: '',
  })
  const [localError, setLocalError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('ONLINE') // 'ONLINE' | 'COD'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const { user } = useAuth()

  const handleChange = (e) => {
    if (error) clearError()
    if (localError) setLocalError('')
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!address.house || !address.street || !address.city || !address.state || !address.zip) {
      setLocalError('Please fill out all address fields.')
      return
    }

    if (items.length === 0) {
      setLocalError('Your cart is empty. Please add items before checkout.')
      return
    }

    if (paymentMethod === 'COD') {
      const createdOrder = await checkout(address)
      if (createdOrder) {
        navigate(`/orders/${createdOrder._id || createdOrder.id}/confirmation`)
      }
      return
    }

    // --- 2. ONLINE PAYMENT FLOW ---
    try {
      setIsProcessingPayment(true)
      // Load Razorpay script
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded) {
        setLocalError('Razorpay SDK failed to load. Are you online?')
        setIsProcessingPayment(false)
        return
      }
      // Call backend to create Razorpay Order & internal Order
      const res = await orderApi.createPaymentOrder(address)
      const { keyId, razorpayOrderId, amount, currency, orderId } = res.data
      // Configure Razorpay Checkout modal
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'Snitch Menswear',
        description: 'Order Payment',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Verify on backend
            await orderApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            navigate(`/orders/${orderId}/confirmation`)
          } catch (err) {
            setLocalError(err.message || 'Payment verification failed.')
          } finally {
            setIsProcessingPayment(false)
          }
        },
        prefill: {
          name: user?.name || 'Valued Customer',
          email: user?.email || 'customer@snitch.co',
          contact: user?.phone || '9999999999',
        },
        readonly: {
          contact: true,
          email: true,
          name: true,
        },
        theme: {
          color: '#1C1917', // Match Snitch branding color
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay via UPI / QR Code',
                instruments: [
                  {
                    method: 'upi',
                  },
                ],
              },
              other: {
                name: 'Cards & Other Modes',
                instruments: [
                  {
                    method: 'card',
                  },
                  {
                    method: 'netbanking',
                  },
                  {
                    method: 'wallet',
                  },
                ],
              },
            },
            sequence: ['block.upi', 'block.other'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false)
          },
        },
      }
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response) {
        setLocalError(response.error.description || 'Payment failed.')
        setIsProcessingPayment(false)
      })
      rzp.open()
    } catch (err) {
      setLocalError(err.message || 'Failed to initiate payment.')
      setIsProcessingPayment(false)
    }
  }

  const formatPrice = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="border-b border-hairline pb-6 mb-8 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-eyebrow text-ink-muted">Step 2 of 2</span>
          <h1 className="font-serif text-3xl md:text-4xl text-ink font-normal mt-1">
            Shipping & Payment
          </h1>
        </div>
        <button
          type="button"
          onClick={() => navigate('/bag')}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-eyebrow text-ink hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bag
        </button>
      </div>

      {(error || localError) && (
        <div className="mb-8 p-4 bg-critical/10 border border-critical text-critical text-xs">
          {error || localError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Address & Payment Form (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-surface border border-hairline p-6 sm:p-8 space-y-6">
              <h3 className="font-serif text-xl text-ink border-b border-hairline pb-4">
                1. Delivery Address
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-eyebrow text-ink mb-2">
                    Flat / House / Building No. *
                  </label>
                  <input
                    type="text"
                    name="house"
                    value={address.house}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Flat 402, Royale Heights"
                    className="w-full bg-canvas border border-hairline px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-eyebrow text-ink mb-2">
                    Street / Road / Area *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={address.street}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 100 Feet Road, Indiranagar"
                    className="w-full bg-canvas border border-hairline px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-eyebrow text-ink mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Bengaluru"
                    className="w-full bg-canvas border border-hairline px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-eyebrow text-ink mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={address.state}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Karnataka"
                    className="w-full bg-canvas border border-hairline px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-eyebrow text-ink mb-2">
                    Postal PIN Code *
                  </label>
                  <input
                    type="text"
                    name="zip"
                    value={address.zip}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 560038"
                    className="w-full bg-canvas border border-hairline px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method */}
            <div className="bg-surface border border-hairline p-6 sm:p-8 space-y-4">
              <h3 className="font-serif text-xl text-ink border-b border-hairline pb-4">
                2. Payment Method
              </h3>

              <div className="space-y-3">
                {/* Online Payment Card */}
                <label
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`p-4 border block cursor-pointer transition-colors ${paymentMethod === 'ONLINE'
                    ? 'border-ink bg-canvas'
                    : 'border-hairline bg-surface hover:border-ink/40'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="ONLINE"
                        checked={paymentMethod === 'ONLINE'}
                        onChange={() => setPaymentMethod('ONLINE')}
                        className="accent-ink"
                      />
                      <div>
                        <span className="text-xs uppercase tracking-eyebrow font-medium text-ink block">
                          Pay Online (UPI, Cards, NetBanking)
                        </span>
                        <span className="text-[11px] text-ink-muted">
                          Instant verification & payment via Razorpay
                        </span>
                      </div>
                    </div>
                    <span className="text-xs uppercase tracking-eyebrow text-positive font-medium">
                      Recommended
                    </span>
                  </div>
                </label>

                {/* Cash on Delivery Card */}
                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 border block cursor-pointer transition-colors ${paymentMethod === 'COD'
                    ? 'border-ink bg-canvas'
                    : 'border-hairline bg-surface hover:border-ink/40'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="accent-ink"
                      />
                      <div>
                        <span className="text-xs uppercase tracking-eyebrow font-medium text-ink block">
                          Cash on Delivery / Standard Invoice
                        </span>
                        <span className="text-[11px] text-ink-muted">
                          Pay with cash or UPI upon delivery
                        </span>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

          </form>
        </div>

        {/* Order Summary Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface border border-hairline p-6 sm:p-8 space-y-6">
            <h3 className="font-serif text-xl text-ink border-b border-hairline pb-4">
              Order Items ({itemCount})
            </h3>

            {/* List of items */}
            <div className="max-h-80 overflow-y-auto divide-y divide-hairline">
              {items.map((item, idx) => {
                const product = item.product || {}
                const mainImage = product.images?.[0]?.url || product.image
                return (
                  <div key={idx} className="py-3 flex gap-3 items-center">
                    <img
                      src={mainImage}
                      alt={product.title}
                      className="w-12 h-14 object-cover bg-canvas border border-hairline"
                    />
                    <div className="flex-1 text-xs">
                      <span className="font-medium text-ink block line-clamp-1">
                        {product.title}
                      </span>
                      <span className="text-ink-muted">
                        Size: {item.size} · Qty: {item.quantity}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-ink">
                      {formatPrice((product.price?.amount || 0) * item.quantity)}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-hairline pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-ink-muted">
                <span>Subtotal</span>
                <span className="text-ink font-medium">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Shipping</span>
                <span className="text-positive text-xs uppercase tracking-eyebrow font-medium">
                  Complimentary
                </span>
              </div>
              <div className="border-t border-hairline pt-3 flex justify-between items-center text-base">
                <span className="font-medium text-ink">Total to Pay</span>
                <span className="font-serif text-2xl text-ink font-normal">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isLoading || isProcessingPayment || items.length === 0}
              className="w-full h-12 bg-ink text-canvas text-xs uppercase tracking-eyebrow font-medium hover:bg-ink/90 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {isProcessingPayment || isLoading ? (
                <span className="inline-block animate-spin border-2 border-canvas border-t-transparent rounded-full w-4 h-4 mr-2" />
              ) : null}
              {isProcessingPayment
                ? 'Opening Razorpay...'
                : isLoading
                  ? 'Placing Order...'
                  : paymentMethod === 'ONLINE'
                    ? 'Proceed to Pay Online'
                    : 'Place Cash on Delivery Order'}
            </button>

            <div className="border-t border-hairline pt-4 text-xs text-ink-muted space-y-2">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-ink" />
                <span>Express courier tracking dispatched upon confirmation</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-ink" />
                <span>Verified boutique purchase guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}