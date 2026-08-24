import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search } from 'lucide-react'
import AdminLayout from './AdminLayout.jsx'
import Button from '../../components/Button.jsx'
import {
  adminFetchReturns,
  adminUpdateReturnStatus,
  adminRefundReturn,
} from '../../redux/slices/adminSlice.js'
import toast from 'react-hot-toast'

const STATUS_FILTERS = [
  'all',
  'requested',
  'pickup_scheduled',
  'picked_up',
  'in_transit',
  'received',
  'qc_failed',
  'qc_passed',
  'refund_pending',
  'refund_processed',
  'refund_failed',
]

const STATUS_OPTIONS = STATUS_FILTERS.filter(s => s !== 'all')

export default function AdminReturns() {
  const dispatch = useDispatch()
  const { returns, totalReturns, loading } = useSelector(s => s.admin)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    dispatch(adminFetchReturns({
      page,
      status: statusFilter === 'all' ? undefined : statusFilter,
      search,
      limit: 15,
    }))
  }, [dispatch, page, statusFilter, search])

  const handleStatus = async (id, status) => {
    const result = await dispatch(adminUpdateReturnStatus({ id, status }))
    if (adminUpdateReturnStatus.fulfilled.match(result)) toast.success('Return status updated')
    else toast.error(result.payload || 'Failed to update')
  }

  const handleRefund = async (r) => {
    const rupees = prompt('Refund amount (₹):', '')
    if (rupees === null) return
    const amount = Math.round(Number(rupees) * 100)
    if (!amount || amount < 1) {
      toast.error('Enter a valid amount')
      return
    }
    const result = await dispatch(adminRefundReturn({ id: r._id, amount, speed: 'optimum' }))
    if (adminRefundReturn.fulfilled.match(result)) toast.success('Refund initiated')
    else toast.error(result.payload || 'Failed to initiate refund')
  }

  const totalPages = Math.ceil((totalReturns || 0) / 15)

  return (
    <AdminLayout title="Returns" subtitle={`${totalReturns || 0} total return requests`}>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search (reason)..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap capitalize transition-all ${
                statusFilter === s ? 'bg-primary-500 text-white' : 'glass text-slate-400 hover:text-white'
              }`}
            >
              {s === 'all' ? 'All Returns' : s.replaceAll('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3.5 text-slate-400 font-medium">Return ID</th>
                <th className="text-left px-5 py-3.5 text-slate-400 font-medium">Order</th>
                <th className="text-left px-5 py-3.5 text-slate-400 font-medium hidden md:table-cell">Customer</th>
                <th className="text-left px-5 py-3.5 text-slate-400 font-medium">Status</th>
                <th className="text-left px-5 py-3.5 text-slate-400 font-medium hidden lg:table-cell">Tracking</th>
                <th className="text-left px-5 py-3.5 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !returns?.length ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-3"><div className="h-8 glass rounded animate-pulse" /></td></tr>
                ))
              ) : (returns || []).map((r) => (
                <tr key={r._id} className="table-row">
                  <td className="px-5 py-3.5">
                    <span className="text-slate-300 font-mono text-xs">#{r._id?.slice(-8).toUpperCase()}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-slate-300 font-mono text-xs">#{r.order?._id?.slice(-8).toUpperCase()}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <div>
                      <p className="text-slate-200 text-xs">{r.user?.name || '-'}</p>
                      <p className="text-slate-500 text-xs">{r.user?.email || ''}</p>
                      {r.refund?.manualRefundDetails && (
                        <div className="mt-2 p-2 bg-primary-500/10 border border-primary-500/20 rounded-md">
                          <p className="text-primary-300 text-[10px] font-bold uppercase mb-1">
                            {r.order?.paymentMethod === 'cod' ? 'COD Refund Details' : 'Razorpay Refund Details'}
                          </p>
                          {r.refund.manualRefundDetails.method === 'upi' ? (
                            <p className="text-slate-300 text-xs">UPI: <span className="font-mono">{r.refund.manualRefundDetails.upiId}</span></p>
                          ) : (
                            <div className="text-slate-300 text-[10px] space-y-0.5">
                              <p>Bank: {r.refund.manualRefundDetails.bankName}</p>
                              <p>A/C: {r.refund.manualRefundDetails.accountNumber}</p>
                              <p>IFSC: {r.refund.manualRefundDetails.ifscCode}</p>
                              <p>Name: {r.refund.manualRefundDetails.accountName}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      value={r.status}
                      onChange={e => handleStatus(r._id, e.target.value)}
                      className="input-field py-2 text-xs w-44"
                      disabled={loading}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt} value={opt} className="bg-dark-800">{opt}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-slate-400 text-xs">{r.order?.trackingNumber || '-'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Button
                      variant="secondary"
                      className="py-1.5 px-3 text-xs"
                      onClick={() => handleRefund(r)}
                      disabled={loading || !['qc_passed', 'received', 'refund_pending', 'refund_failed'].includes(r.status)}
                      title="Trigger Razorpay refund"
                    >
                      Refund
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && (returns || []).length === 0 && (
            <div className="text-center py-12 text-slate-500">No returns found</div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-xl text-sm transition-all ${page === i + 1 ? 'bg-primary-500 text-white' : 'glass text-slate-400 hover:text-white'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
