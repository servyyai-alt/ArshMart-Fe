import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, CheckCircle } from 'lucide-react'
import SEO from '../components/SEO.jsx'
import api from '../utils/api.js'

export default function ReturnDetail() {
  const { id } = useParams()
  const [returnRequest, setReturnRequest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/returns/${id}`)
      .then((res) => setReturnRequest(res.data.returnRequest))
      .catch(() => setReturnRequest(null))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <>
      <SEO title="Return Details – Arsh Mart" noindex />
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/returns" className="btn-ghost text-sm mb-6 inline-flex">
            <ChevronLeft className="w-4 h-4" />
            Back to Returns
          </Link>

          {loading ? (
            <div className="glass-card h-40 animate-pulse" />
          ) : !returnRequest ? (
            <div className="glass-card p-6">
              <p className="text-slate-900 text-sm">Return not found</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="glass-card p-6 border border-amber-500/20 bg-amber-500/5 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-amber-500 font-semibold text-sm">Return Request Submitted</h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Your return request has been submitted successfully. Pickup details and updates will be shown below.
                  </p>
                </div>
              </div>

              <div className="glass-card p-6">
                <h1 className="text-black font-semibold text-lg">
                  Return #{returnRequest._id?.slice(-8).toUpperCase()}
                </h1>
                <p className="text-slate-900 text-sm mt-1">Status: {returnRequest.status}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
