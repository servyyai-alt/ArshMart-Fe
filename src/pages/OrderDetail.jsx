import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronLeft, Package, Truck } from 'lucide-react'
import SEO from '../components/SEO.jsx'
import Button from '../components/Button.jsx'
import { fetchOrderById } from '../redux/slices/orderSlice.js'
import { ORDER_STATUSES } from '../styles/theme.js'
import { formatProductDimensionsSummary } from '../utils/productDimensions.js'
import api from '../utils/api.js'
import toast from 'react-hot-toast'

const isValidUpiId = (id) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(id)

export default function OrderDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { order, loading, error } = useSelector(state => state.orders)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [otherReason, setOtherReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  const [returnNotes, setReturnNotes] = useState('')
  const [refundMethod, setRefundMethod] = useState('upi')
  const [manualRefundDetails, setManualRefundDetails] = useState({
    upiId: '',
    accountName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  })
  const [returning, setReturning] = useState(false)

  useEffect(() => {
    if (id) dispatch(fetchOrderById(id))
  }, [id, dispatch])

  const status = ORDER_STATUSES[order?.orderStatus] || ORDER_STATUSES.pending
  const cancelOptions = useMemo(() => ([
    'Ordered by mistake',
    'Found cheaper elsewhere',
    'Delivery taking too long',
    'Other',
  ]), [])

  const { canCancel, canRequestReturn, returnExpired } = useMemo(() => {
    let cancel = false;
    let reqReturn = false;
    let expired = false;

    if (order) {
      // Cancel logic: Only allow cancellation before shipment starts (pending or processing)
      if (['pending', 'processing'].includes(order.orderStatus)) {
        cancel = true;
      }

      // Return logic: Only allow within 3 days after delivery, if no existing request
      if (order.orderStatus === 'delivered' && !order.return?.hasReturnRequest) {
        if (order.deliveredAt) {
          const deliveredMs = new Date(order.deliveredAt).getTime();
          if (!Number.isNaN(deliveredMs)) {
            const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
            if (Date.now() - deliveredMs <= threeDaysMs) {
              reqReturn = true;
            } else {
              expired = true;
            }
          }
        }
      }
    }
    return { canCancel: cancel, canRequestReturn: reqReturn, returnExpired: expired };
  }, [order])

  const submitReturn = async () => {
    const trimmed = String(returnReason || '').trim()
    if (!trimmed) {
      toast.error('Please enter a return reason')
      return
    }

    let sanitizedRefundDetails = undefined
    if (refundMethod === 'upi') {
      const upiId = String(manualRefundDetails.upiId || '').trim()
      if (!upiId) {
        toast.error('Please enter your UPI ID')
        return
      }
      if (!isValidUpiId(upiId)) {
        toast.error('Invalid UPI ID format. Example: name@oksbi')
        return
      }
      sanitizedRefundDetails = {
        method: 'upi',
        upiId,
      }
    } else if (refundMethod === 'bank') {
      const accountName = String(manualRefundDetails.accountName || '').trim()
      const bankName = String(manualRefundDetails.bankName || '').trim()
      const accountNumber = String(manualRefundDetails.accountNumber || '').trim()
      const ifscCode = String(manualRefundDetails.ifscCode || '').trim()

      if (!accountName) {
        toast.error('Please enter Account Holder Name')
        return
      }
      if (!bankName) {
        toast.error('Please enter Bank Name')
        return
      }
      if (!accountNumber) {
        toast.error('Please enter Account Number')
        return
      }
      if (!ifscCode) {
        toast.error('Please enter IFSC Code')
        return
      }

      sanitizedRefundDetails = {
        method: 'bank',
        accountName,
        bankName,
        accountNumber,
        ifscCode,
      }
    } else {
      toast.error('Please select a valid refund method')
      return
    }

    setReturning(true)
    try {
      const items = (order.orderItems || []).map((it) => ({
        productId: it.product,
        quantity: it.quantity,
        reasonText: trimmed,
      }))
      const payload = { 
        orderId: order._id, 
        items, 
        reason: trimmed, 
        notes: String(returnNotes || '').trim(),
        manualRefundDetails: sanitizedRefundDetails
      }
      const { data } = await api.post('/returns', payload)
      toast.success('Return request submitted')
      setReturnOpen(false)
      setReturnReason('')
      setReturnNotes('')
      dispatch(fetchOrderById(order._id))
      if (data.returnRequest?._id) {
        window.location.href = `/returns/${data.returnRequest._id}`
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create return request')
    } finally {
      setReturning(false)
    }
  }

  const confirmCancel = async () => {
    const reason = selectedReason === 'Other' ? (otherReason || 'Other') : selectedReason
    const notes = otherReason !== reason ? otherReason : ''
    
    const trimmedReason = String(reason || '').trim()
    if (!trimmedReason) {
      toast.error('Please select or type a cancellation reason')
      return
    }

    let sanitizedRefundDetails = undefined
    const isOnlinePayment = order.paymentMethod !== 'cod'
    if (isOnlinePayment) {
      if (refundMethod === 'upi') {
        const upiId = String(manualRefundDetails.upiId || '').trim()
        if (!upiId) {
          toast.error('Please enter your UPI ID')
          return
        }
        if (!isValidUpiId(upiId)) {
          toast.error('Invalid UPI ID format. Example: name@oksbi')
          return
        }
        sanitizedRefundDetails = {
          method: 'upi',
          upiId,
        }
      } else if (refundMethod === 'bank') {
        const accountName = String(manualRefundDetails.accountName || '').trim()
        const bankName = String(manualRefundDetails.bankName || '').trim()
        const accountNumber = String(manualRefundDetails.accountNumber || '').trim()
        const ifscCode = String(manualRefundDetails.ifscCode || '').trim()

        if (!accountName) {
          toast.error('Please enter Account Holder Name')
          return
        }
        if (!bankName) {
          toast.error('Please enter Bank Name')
          return
        }
        if (!accountNumber) {
          toast.error('Please enter Account Number')
          return
        }
        if (!ifscCode) {
          toast.error('Please enter IFSC Code')
          return
        }

        sanitizedRefundDetails = {
          method: 'bank',
          accountName,
          bankName,
          accountNumber,
          ifscCode,
        }
      } else {
        toast.error('Please select a valid refund method')
        return
      }
    }

    setCancelling(true)
    try {
      const { data } = await api.put(`/orders/${order._id}/cancel`, { 
        reason: trimmedReason,
        notes: String(notes || '').trim(),
        manualRefundDetails: sanitizedRefundDetails
      })
      const refundStatus = data?.refund?.status
      if (refundStatus === 'processed' || refundStatus === 'pending') {
        toast.success('Order cancelled. Refund initiated.')
      } else {
        toast.success('Order cancelled')
      }
      setCancelOpen(false)
      setSelectedReason('')
      setOtherReason('')
      setManualRefundDetails({
        upiId: '',
        accountName: '',
        bankName: '',
        accountNumber: '',
        ifscCode: ''
      })
      dispatch(fetchOrderById(order._id))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <>
      <SEO title="Order Details – Arsh Mart" noindex />
      <div className="customer-page min-h-screen pt-24 pb-20 mt-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-8">
            <Link to="/orders" className="btn-ghost text-slate-300 hover:text-black text-sm">
              <ChevronLeft className="w-4 h-4" />
              Back to Orders
            </Link>
            <div className="flex gap-2 items-center">
              {returnExpired && (
                <span className="text-sm text-slate-500 font-medium px-2">
                  Return window expired
                </span>
              )}
              {canRequestReturn && (
                <Button className="!bg-[#dc2626] hover:!bg-[#b91c1c] !text-white !border-0" onClick={() => setReturnOpen(true)}>
                  Request Return
                </Button>
              )}
              {canCancel && (
                <Button variant="danger" className='text-red-600' onClick={() => setCancelOpen(true)}>
                  Cancel Order
                </Button>
              )}
            </div>
          </div>

          {loading && (
            <div className="glass-card h-40 animate-pulse" />
          )}

          {!loading && error && (
            <div className="glass-card p-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && !order && (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Order not found</h2>
              <Link to="/orders" className="btn-primary">Go to Orders</Link>
            </div>
          )}

          {!loading && order && (
            <div className="space-y-6">
              {/* Header */}
              <div className="glass-card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-slate-900 font-semibold text-lg">
                        Order #{order._id?.slice(-8).toUpperCase()}
                      </h1>
                      <span className={`badge text-xs border ${status.color}`}>{status.label}</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    {order.trackingNumber && (
                      <p className="text-xs text-primary-400 flex items-center gap-1 mt-2">
                        <Truck className="w-3 h-3" />
                        AWB: {order.trackingNumber}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-slate-500 text-xs">Total</div>
                    <div className="text-primary-400 font-bold text-2xl">₹{order.totalPrice?.toLocaleString('en-IN')}</div>
                    <div className="text-slate-500 text-xs mt-1">
                      Payment: {order.isPaid ? 'Paid' : 'Pending'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping + Summary */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="glass-card p-6 md:col-span-2">
                  <h2 className="text-slate-900 font-semibold mb-4">Shipping Details</h2>
                  <div className="text-sm text-slate-500 space-y-1">
                    <p><span className="text-slate-600">Name:</span> {order.shippingAddress?.fullName}</p>
                    <p><span className="text-slate-500">Phone:</span> {order.shippingAddress?.phone}</p>
                    <p className="text-slate-500">
                      {order.shippingAddress?.addressLine1}
                      {order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
                    </p>
                    <p className="text-slate-500">
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                    </p>
                    <p className="text-slate-500">{order.shippingAddress?.country || 'India'}</p>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h2 className="text-slate-900 font-semibold mb-4">Price Summary</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Items</span><span className="text-slate-600">₹{order.itemsPrice?.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span className="text-slate-600">₹{order.shippingPrice?.toLocaleString('en-IN')}</span></div>
                    <div className="border-t border-white/10 pt-2 flex justify-between font-semibold">
                      <span className="text-slate-500">Total</span>
                      <span className="text-slate-600">₹{order.totalPrice?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="glass-card p-6">
                <h2 className="text-slate-900 font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-400" />
                  Items ({order.orderItems?.length || 0})
                </h2>
                <div className="space-y-4">
                  {order.orderItems?.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-b-0">
                      <img
                        src={item.image || 'https://via.placeholder.com/80'}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <Link to={`/products/${item.product}`} className="text-slate-900 text-sm font-medium hover:text-primary-400 transition-colors line-clamp-1">
                          {item.name}
                        </Link>
                        <div className="text-xs text-slate-500 mt-1">
                          Qty: {item.quantity}
                        </div>
                        {(() => {
                          const summary = formatProductDimensionsSummary(item)
                          if (!summary.hasDimensions && !summary.hasWeight) return null
                          return (
                            <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                              <p>Dimensions: {summary.dimensionsText}</p>
                              <p>Weight: {summary.weightText}</p>
                            </div>
                          )
                        })()}
                      </div>
                      <div className="text-white font-semibold text-sm">
                        ₹{(item.price * item.quantity)?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {cancelOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-black/60"
            onClick={() => !cancelling && setCancelOpen(false)}
            aria-label="Close cancel modal"
          />
          <div className="relative w-full max-w-lg glass-card p-6 border border-white/10 flex flex-col max-h-[85vh]">
            <div className="flex-shrink-0">
              <h3 className="text-white font-semibold text-lg">Cancel order?</h3>
              <p className="text-slate-500 text-sm mt-1">
                Please tell us why you want to cancel. This helps us improve.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
              <div className="space-y-2">
                {cancelOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-3 glass px-4 py-3 rounded-xl cursor-pointer border border-white/10 hover:border-primary-500/20">
                    <input
                      type="radio"
                      name="cancelReason"
                      value={opt}
                      checked={selectedReason === opt}
                      onChange={(e) => setSelectedReason(e.target.value)}
                    />
                    <span className="text-slate-600 text-sm">{opt}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="label">Reason (required)</label>
                <textarea
                  className="input-field resize-none h-24"
                  placeholder="Type your reason…"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Select an option above or type your own reason.
                </p>
              </div>

              {order.paymentMethod !== 'cod' && (
              <div className="p-4 border border-primary-500/30 rounded-xl bg-primary-50/10">
                <h4 className="text-[#2a365b] font-medium text-sm mb-3">Refund Details</h4>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 text-sm text-[#2a365b] cursor-pointer">
                    <input type="radio" name="cancelRefundMethod" value="upi" checked={refundMethod === 'upi'} onChange={() => setRefundMethod('upi')} />
                    UPI ID
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#2a365b] cursor-pointer">
                    <input type="radio" name="cancelRefundMethod" value="bank" checked={refundMethod === 'bank'} onChange={() => setRefundMethod('bank')} />
                    Bank Account
                  </label>
                </div>

                {refundMethod === 'upi' ? (
                  <div>
                    <label className="label">UPI ID *</label>
                    <input className="input-field" placeholder="example@okhdfcbank" value={manualRefundDetails.upiId} onChange={e => setManualRefundDetails({...manualRefundDetails, upiId: e.target.value})} required />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="label">Account Holder Name *</label>
                      <input className="input-field" value={manualRefundDetails.accountName} onChange={e => setManualRefundDetails({...manualRefundDetails, accountName: e.target.value})} required />
                    </div>
                    <div>
                      <label className="label">Bank Name *</label>
                      <input className="input-field" value={manualRefundDetails.bankName} onChange={e => setManualRefundDetails({...manualRefundDetails, bankName: e.target.value})} required />
                    </div>
                    <div>
                      <label className="label">Account Number *</label>
                      <input className="input-field" value={manualRefundDetails.accountNumber} onChange={e => setManualRefundDetails({...manualRefundDetails, accountNumber: e.target.value})} required />
                    </div>
                    <div>
                      <label className="label">IFSC Code *</label>
                      <input className="input-field" value={manualRefundDetails.ifscCode} onChange={e => setManualRefundDetails({...manualRefundDetails, ifscCode: e.target.value})} required />
                    </div>
                  </div>
                )}
              </div>
              )}
            </div>

            <div className="flex-shrink-0 flex gap-3 justify-end pt-4 border-t border-white/10">
              <Button variant="secondary" className='text-slate-500 hover:text-black' onClick={() => setCancelOpen(false)} disabled={cancelling}>
                Keep Order
              </Button>
              <Button variant="danger" className='text-red-700' onClick={confirmCancel} loading={cancelling}>
                Confirm Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {returnOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-black/60"
            onClick={() => !returning && setReturnOpen(false)}
            aria-label="Close return modal"
          />
          <div className="relative w-full max-w-lg glass-card p-6 border border-white/10 flex flex-col max-h-[85vh]">
            <div className="flex-shrink-0">
              <h3 className="text-white font-semibold text-lg">Request a return</h3>
              <p className="text-slate-500 text-sm mt-1">
                Return pickup will be arranged after eligibility checks.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
              <div>
                <label className="label">Reason (required)</label>
                <textarea
                  className="input-field resize-none h-24"
                  placeholder="Type your return reason…"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Notes (optional)</label>
                <textarea
                  className="input-field resize-none h-20"
                  placeholder="Any additional details…"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                />
              </div>

              <div className="p-4 border border-primary-500/30 rounded-xl bg-primary-50/10">
                <h4 className="text-[#2a365b] font-medium text-sm mb-3">Refund Details</h4>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 text-sm text-[#2a365b] cursor-pointer">
                    <input type="radio" name="refundMethod" value="upi" checked={refundMethod === 'upi'} onChange={() => setRefundMethod('upi')} />
                    UPI ID
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#2a365b] cursor-pointer">
                    <input type="radio" name="refundMethod" value="bank" checked={refundMethod === 'bank'} onChange={() => setRefundMethod('bank')} />
                    Bank Account
                  </label>
                </div>

                {refundMethod === 'upi' ? (
                  <div>
                    <label className="label">UPI ID *</label>
                    <input className="input-field" placeholder="example@okhdfcbank" value={manualRefundDetails.upiId} onChange={e => setManualRefundDetails({...manualRefundDetails, upiId: e.target.value})} required />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="label">Account Holder Name *</label>
                      <input className="input-field" value={manualRefundDetails.accountName} onChange={e => setManualRefundDetails({...manualRefundDetails, accountName: e.target.value})} required />
                    </div>
                    <div>
                      <label className="label">Bank Name *</label>
                      <input className="input-field" value={manualRefundDetails.bankName} onChange={e => setManualRefundDetails({...manualRefundDetails, bankName: e.target.value})} required />
                    </div>
                    <div>
                      <label className="label">Account Number *</label>
                      <input className="input-field" value={manualRefundDetails.accountNumber} onChange={e => setManualRefundDetails({...manualRefundDetails, accountNumber: e.target.value})} required />
                    </div>
                    <div>
                      <label className="label">IFSC Code *</label>
                      <input className="input-field" value={manualRefundDetails.ifscCode} onChange={e => setManualRefundDetails({...manualRefundDetails, ifscCode: e.target.value})} required />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 flex gap-3 justify-end pt-4 border-t border-white/10">
              <Button className="!bg-[#dc2626] hover:!bg-[#b91c1c] !text-white !border-0" onClick={() => setReturnOpen(false)} disabled={returning}>
                Cancel
              </Button>
              <Button onClick={submitReturn} loading={returning}>
                Submit Return
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
