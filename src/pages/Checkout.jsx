import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { MapPin, CreditCard, Package, CheckCircle } from 'lucide-react'
import SEO from '../components/SEO.jsx'
import Button from '../components/Button.jsx'
import { selectCartTotal, clearCart } from '../redux/slices/cartSlice.js'
import { createOrder } from '../redux/slices/orderSlice.js'
import { initiatePayment } from '../utils/razorpay.js'
import toast from 'react-hot-toast'
import api from '../utils/api.js'

const STEPS = [
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'confirm', label: 'Confirm', icon: CheckCircle },
]

export default function Checkout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const buyNowItem = location.state?.buyNowItem

  const { items: cartItems } = useSelector(state => state.cart)
  const items = buyNowItem ? [buyNowItem] : cartItems

  const { coupon } = useSelector(state => state.cart)
  const { user } = useSelector(state => state.auth)
  const { loading } = useSelector(state => state.orders)
  
  const cartSubtotal = useSelector(selectCartTotal)
  const subtotal = buyNowItem ? (buyNowItem.price * buyNowItem.quantity) : cartSubtotal
  
  const [storeSettings, setStoreSettings] = useState({
    freeShippingThreshold: 499,
    shippingCharge: 49,
    freeShippingEnabled: true,
  })

  useEffect(() => {
    let mounted = true
    api.get('/settings')
      .then((res) => {
        const g = res.data?.settings?.general
        if (!mounted || !g) return
        setStoreSettings((prev) => ({
          ...prev,
          freeShippingThreshold: Number.isFinite(Number(g.freeShippingThreshold)) ? Number(g.freeShippingThreshold) : prev.freeShippingThreshold,
          shippingCharge: Number.isFinite(Number(g.shippingCharge)) ? Number(g.shippingCharge) : prev.shippingCharge,
          freeShippingEnabled: typeof g.freeShippingEnabled === 'boolean' ? g.freeShippingEnabled : prev.freeShippingEnabled,
        }))
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const shipping = useMemo(() => {
    const threshold = Number(storeSettings.freeShippingThreshold) || 0
    const charge = Number(storeSettings.shippingCharge) || 0
    if (!storeSettings.freeShippingEnabled) return charge
    // If threshold is 0/disabled, always apply charge (unless charge is 0).
    if (threshold > 0 && subtotal >= threshold) return 0
    return charge
  }, [subtotal, storeSettings.freeShippingEnabled, storeSettings.freeShippingThreshold, storeSettings.shippingCharge])

  const baseTotal = useMemo(() => subtotal + shipping, [subtotal, shipping])
  const discount = useMemo(() => {
    const percent = Number(coupon?.percent) || 0
    if (!coupon?.code || percent <= 0) return 0
    return Math.round((baseTotal * percent) / 100)
  }, [coupon?.code, coupon?.percent, baseTotal])
  const total = useMemo(() => Math.max(0, baseTotal - discount), [baseTotal, discount])
  const [step, setStep] = useState('address')
  const [paymentVerifying, setPaymentVerifying] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [abandonedCheckoutId, setAbandonedCheckoutId] = useState(null)
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  })
  const [savedAddressId, setSavedAddressId] = useState('')
  const [addressInitializedForUser, setAddressInitializedForUser] = useState('')

  const savedAddresses = useMemo(
    () => (Array.isArray(user?.addresses) ? user.addresses : []),
    [user?.addresses]
  )

  useEffect(() => {
    if (!user || addressInitializedForUser === user._id) return

    const preferredAddress = savedAddresses.find((item) => item.isDefault) || savedAddresses[0]
    setAddress({
      fullName: preferredAddress?.fullName || user.name || '',
      phone: preferredAddress?.phone || user.phone || '',
      addressLine1: preferredAddress?.addressLine1 || '',
      addressLine2: preferredAddress?.addressLine2 || '',
      city: preferredAddress?.city || '',
      state: preferredAddress?.state || '',
      pincode: preferredAddress?.pincode || '',
      country: preferredAddress?.country || 'India',
    })
    setSavedAddressId(preferredAddress?._id || '')
    setAddressInitializedForUser(user._id)
  }, [user, savedAddresses, addressInitializedForUser])

  const handleSavedAddressChange = (addressId) => {
    setSavedAddressId(addressId)
    if (!addressId) return

    const selected = savedAddresses.find((item) => item._id === addressId)
    if (!selected) return

    setAddress({
      fullName: selected.fullName || user?.name || '',
      phone: selected.phone || user?.phone || '',
      addressLine1: selected.addressLine1 || '',
      addressLine2: selected.addressLine2 || '',
      city: selected.city || '',
      state: selected.state || '',
      pincode: selected.pincode || '',
      country: selected.country || 'India',
    })
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode']
    const missing = required.find(field => !address[field])
    if (missing) { toast.error('Please fill all required fields'); return }
    if (!/^\d{6}$/.test(String(address.pincode || '').trim())) {
      toast.error('Please enter a valid 6-digit pincode')
      return
    }
    
    try {
      // Create the pending AbandonedCheckout record
      try {
        const checkoutData = {
          name: address.fullName,
          phone: address.phone,
          email: user?.email || '',
          products: items.map(item => ({
            product: item._id || item.id || item.productId,
            name: item.name,
            image: item.images?.[0]?.url || item.image,
            price: item.price,
            quantity: item.quantity
          })),
          cartTotal: total,
          address: address
        }
        const checkoutRes = await api.post('/checkouts/abandoned', checkoutData)
        if (checkoutRes.data?.success) {
          setAbandonedCheckoutId(checkoutRes.data.checkoutId)
        }
      } catch (checkoutErr) {
        console.error('Failed to create pending checkout:', checkoutErr)
      }
    } catch (err) {
      toast.error(err?.message || 'Unable to continue right now.')
      setStep('address')
      return
    }
    setStep('payment')
  }

  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        orderItems: items.map(item => ({
          product: item._id || item.id || item.productId,
          name: item.name,
          image: item.images?.[0]?.url,
          price: item.price,
          quantity: item.quantity,
          dimensions: item.dimensions || null,
        })),
        shippingAddress: address,
        paymentMethod,
        itemsPrice: subtotal,
        shippingPrice: shipping,
        totalPrice: total,
        couponCode: coupon?.code || '',
      }

      const resultAction = await dispatch(createOrder(orderData))
      if (createOrder.fulfilled.match(resultAction)) {
        const order = resultAction.payload

        // Link the placed order to the pending abandoned checkout record
        if (abandonedCheckoutId) {
          try {
            await api.put(`/checkouts/abandoned/${abandonedCheckoutId}/link`, {
              orderId: order._id,
              paymentMethod
            })
          } catch (linkErr) {
            console.error('Failed to link order to pending checkout:', linkErr)
          }
        }

        if (paymentMethod === 'cod') {
          if (!buyNowItem) dispatch(clearCart())
          toast.success('Order placed successfully! 🎉')
          navigate(`/order-success/${order._id}`)
        } else {
          initiatePayment({
            amount: total * 100,
            orderId: order._id,
            user,
            onProcessing: (stage) => {
              if (stage === 'verifying') setPaymentVerifying(true)
            },
            onSuccess: () => {
              if (!buyNowItem) dispatch(clearCart())
              toast.success('Order placed successfully! 🎉')
              navigate(`/order-success/${order._id}`)
            },
            onFailure: (err) => {
              setPaymentVerifying(false)
              toast.error(err || 'Payment failed')
            },
          })
        }
      } else {
        const message = resultAction.payload || 'Failed to place order'
        toast.error(message)
        if (/not authenticated|token expired|invalid token/i.test(String(message))) {
          navigate('/login?redirect=/checkout', { state: { from: { pathname: '/checkout' } } })
        }
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to place order')
    }
  }

  return (
    <>
      <SEO title="Checkout – Arsh Mart" noindex />
      <div className="customer-page min-h-screen mt-7 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        {paymentVerifying && (
          <div className="fixed inset-0 z-[70] bg-dark-950/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="glass-card p-6 w-full max-w-sm text-center">
              <div className="spinner w-10 h-10 mx-auto" />
              <p className="text-white font-semibold mt-4">Verifying payment…</p>
              <p className="text-white text-sm mt-1">Please don’t close this window.</p>
            </div>
          </div>
        )}
        <div className="max-w-6xl mx-auto">
          <h1 className="page-header mb-8">Checkout</h1>

          {/* Progress */}
          <div className="flex items-center gap-4 mb-10">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  step === s.id
                    ? 'bg-primary-500 text-white'
                    : STEPS.findIndex(x => x.id === step) > i
                    ? 'glass text-green-500 bg-green-50 border-green-500/30'
                    : 'glass bg-black/10 text-slate-500'
                }`}>
                  <s.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className="h-px w-8 bg-white/10" />}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {step === 'address' && (
                <div className="glass-card p-6 animate-fade-in">
                  <h2 className="text-[#2a365b] font-semibold text-lg mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-400" />
                    Delivery Address
                  </h2>
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    {savedAddresses.length > 0 && (
                      <div>
                        <label className="label">Saved Address</label>
                        <select
                          className="input-field"
                          value={savedAddressId}
                          onChange={(e) => handleSavedAddressChange(e.target.value)}
                        >
                          <option value="">Enter a new address</option>
                          {savedAddresses.map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.fullName} - {item.city}, {item.state}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Full Name *</label>
                        <input className="input-field" value={address.fullName} onChange={e => setAddress(a => ({ ...a, fullName: e.target.value }))} required />
                      </div>
                      <div>
                        <label className="label">WhatsApp Number *</label>
                        <input
                          className="input-field"
                          value={address.phone}
                          onChange={e => setAddress(a => ({ ...a, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                          maxLength={10}
                          inputMode="numeric"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">Address Line 1 *</label>
                      <input className="input-field" value={address.addressLine1} onChange={e => setAddress(a => ({ ...a, addressLine1: e.target.value }))} required />
                    </div>
                    <div>
                      <label className="label">Address Line 2</label>
                      <input className="input-field" value={address.addressLine2} onChange={e => setAddress(a => ({ ...a, addressLine2: e.target.value }))} />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="label">City *</label>
                        <input className="input-field" value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} required />
                      </div>
                      <div>
                        <label className="label">State *</label>
                        <input className="input-field" value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))} required />
                      </div>
                      <div>
                        <label className="label">Pincode *</label>
                        <input
                          className="input-field"
                          value={address.pincode}
                          onChange={e => setAddress(a => ({ ...a, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                          maxLength={6}
                          inputMode="numeric"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full text-white justify-center py-4 mt-2">
                      Continue to Payment
                    </Button>
                  </form>
                </div>
              )}

              {step === 'payment' && (
                <div className="glass-card p-6 animate-fade-in">
                  <h2 className="text-[#2a365b] font-semibold text-lg mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary-400" />
                    Payment Method
                  </h2>
                  <div className="space-y-3">
                    <div 
                      className={`glass-card p-4 border cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-primary-500 bg-primary-50/10' : 'border-white/10 hover:border-white/30'}`}
                      onClick={() => setPaymentMethod('razorpay')}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-primary-500' : 'border-slate-400'}`}>
                          {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                        </div>
                        <div>
                          <p className="text-[#2a365b] font-medium text-sm">Pay via Razorpay</p>
                          <p className="text-slate-500 text-xs">UPI, Cards, Netbanking, Wallets</p>
                        </div>
                        <img src="https://w7.pngwing.com/pngs/93/992/png-transparent-razorpay-logo-tech-companies.png" alt="Razorpay" className="h-8 w-39 ml-auto opacity-60" />
                      </div>
                    </div>
                    <div 
                      className={`glass-card p-4 border transition-all ${paymentMethod === 'cod' ? 'cursor-pointer border-primary-500 bg-primary-50/10' : 'cursor-pointer border-white/10 hover:border-white/30'}`}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-primary-500' : 'border-slate-400'}`}>
                          {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                        </div>
                        <div>
                          <p className="text-[#2a365b] font-medium text-sm flex items-center gap-2">
                            Cash on Delivery (COD)
                          </p>
                          <p className="text-slate-500 text-xs">Pay at your doorstep</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep('address')} className="btn-secondary flex-1 justify-center py-3 text-black/50 hover:text-black">
                      Back
                    </button>
                    <Button onClick={() => setStep('confirm')} className="flex-1 justify-center py-3 text-white">
                      Review Order
                    </Button>
                  </div>
                </div>
              )}

              {step === 'confirm' && (
                <div className="glass-card p-6 animate-fade-in">
                  <h2 className="text-[#2a365b] font-semibold text-lg mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary-400" />
                    Order Review
                  </h2>

                  <div className="space-y-3 mb-6">
                    {items.map(item => (
                      <div key={item._id} className="flex items-center gap-3 py-2 border-b border-white/5">
                        <span className="text-slate-800 text-sm flex-1 line-clamp-1">{item.name}</span>
                        <span className="text-slate-800 text-sm">×{item.quantity}</span>
                        <span className="text-slate-800 font-medium text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="glass p-4 rounded-xl mb-6 text-sm">
                    <p className="text-slate-800 text-xs uppercase tracking-wider mb-2">Delivering to</p>
                    <p className="text-slate-500">{address.fullName} · {address.phone}</p>
                    <p className="text-slate-500 text-sm">
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                    </p>
                    <p className="text-slate-500 text-sm">
                      {address.city}, {address.state} {address.pincode}
                    </p>
                    <p className="text-slate-500 text-sm">{address.country || 'India'}</p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep('payment')} className="btn-secondary flex-1 justify-center py-3 text-black/50 hover:text-black">
                      Back
                    </button>
                    <Button onClick={handlePlaceOrder} loading={loading} className="flex-1 justify-center py-3 text-white">
                      {paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${total.toLocaleString('en-IN')}`}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div>
              <div className="glass-card p-5 sticky top-24">
                <h3 className="text-[#2a365b] font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-900">Subtotal</span><span className="text-primary-500 font-bold">₹{subtotal.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span className="text-slate-900">Shipping</span><span className={shipping === 0 ? 'text-green-600' : 'text-slate-900'}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                  {coupon?.code && discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-900">Coupon <span className="font-mono text-xs">{coupon.code}</span> ({coupon.percent}%)</span>
                      <span className="text-green-600 font-semibold">-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-2 flex justify-between font-semibold">
                    <span className="text-[#2a365b]">Total</span>
                    <span className="text-[#2a365b] text-base">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
