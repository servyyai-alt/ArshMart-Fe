import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingCart, Heart, Share2, Truck, Shield, RefreshCw, Star, ChevronLeft, ChevronRight, Plus, Minus, Ruler } from 'lucide-react'
import SEO from '../components/SEO.jsx'
import Button from '../components/Button.jsx'
import { fetchProduct, clearProduct } from '../redux/slices/productSlice.js'
import { addToCart } from '../redux/slices/cartSlice.js'
import { loadUser } from '../redux/slices/authSlice.js'
import { generateBreadcrumbSchema, generateProductSchema } from '../utils/seo.js'
import { getTransformedUrl } from '../utils/cloudinary.js'
import { formatEditableNumber, normalizeProductDimensions } from '../utils/productDimensions.js'
import toast from 'react-hot-toast'
import api from '../utils/api.js'
import ProductCard from '../components/ProductCard.jsx'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { product, loading } = useSelector(state => state.products)
  const { user } = useSelector(state => state.auth)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [related, setRelated] = useState([])
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [storeSettings, setStoreSettings] = useState({
    freeShippingThreshold: 499,
    shippingCharge: 49,
  })

  useEffect(() => {
    dispatch(fetchProduct(id))
    return () => dispatch(clearProduct())
  }, [id, dispatch])

  useEffect(() => {
    setSelectedImage(0)
    setSelectedVideo(0)
  }, [id])

  useEffect(() => {
    let mounted = true
    api.get(`/products/${id}/related`)
      .then(res => { if (mounted) setRelated(res.data.products || []) })
      .catch(() => {})
    return () => { mounted = false }
  }, [id])

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
        }))
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  if (loading) return (
    <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
      <div className="spinner w-10 h-10" />
    </div>
  )

  if (!product) return (
    <div className="customer-page min-h-screen pt-24 px-4 flex flex-col items-center justify-center text-center">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="text-xl font-bold text-slate-900">Product not found</h2>
      <Link to="/products" className="btn-primary mt-4">Browse Products</Link>
    </div>
  )

  const handleAddToCart = () => {
    if (product.stock <= 0) { toast.error('Out of stock'); return }
    dispatch(addToCart({ product, quantity }))
    toast.success('Added to cart!')
  }

  const isWishlisted = Boolean(user?.wishlist?.some(pid => String(pid) === String(product._id)))

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to use wishlist')
      return
    }
    try {
      if (isWishlisted) {
        await api.delete(`/users/wishlist/${product._id}`)
        toast.success('Removed from wishlist')
      } else {
        await api.post('/users/wishlist', { productId: product._id })
        toast.success('Added to wishlist')
      }
      dispatch(loadUser())
    } catch (err) {
      toast.error(err.response?.data?.message || 'Wishlist update failed')
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to add a review')
      return
    }
    if (!reviewComment.trim()) {
      toast.error('Please write a review comment')
      return
    }
    setReviewSubmitting(true)
    try {
      await api.post(`/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment.trim() })
      toast.success('Review added!')
      setReviewComment('')
      setReviewRating(5)
      dispatch(fetchProduct(id))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add review')
    } finally {
      setReviewSubmitting(false)
    }
  }

  const hasVideos = (product.videos?.length || 0) > 0
  const showVideoInHero = hasVideos && activeTab === 'videos'

  const mainImage = product.images?.[selectedImage]?.url
    ? getTransformedUrl(product.images[selectedImage].url, { width: 600, height: 600 })
    : 'https://via.placeholder.com/600x600?text=No+Image'

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0
  const dimensions = normalizeProductDimensions(product)
  const dimensionRows = dimensions ? [
    { label: 'Width', value: dimensions.width, unit: dimensions.dimensionUnit },
    { label: 'Depth', value: dimensions.length, unit: dimensions.dimensionUnit },
    { label: 'Height', value: dimensions.height, unit: dimensions.dimensionUnit },
    { label: 'Weight', value: dimensions.weight, unit: dimensions.weightUnit },
  ] : []
  const highlights = (product.highlights || [])
    .map((item) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object') return [item.key, item.value].filter(Boolean).join(': ')
      return ''
    })
    .map(text => String(text).trim())
    .filter(Boolean)

  return (
    <>
      <SEO
        title={product.name}
        description={product.description?.substring(0, 160)}
        canonicalPath={`/products/${product._id}`}
        ogImage={product.images?.[0]?.url}
        type="product"
        schema={[generateProductSchema(product), generateBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Products', path: '/products' },
          { name: product.category, path: `/products?category=${encodeURIComponent(product.category)}` },
          { name: product.name, path: `/products/${product._id}` },
        ])]}
      />

      <div className="customer-page min-h-screen mt-7 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Back Button */}
          <div className="block sm:hidden mb-4">
            <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white font-medium text-sm transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Link>
          </div>

          {/* Breadcrumb */}
          <nav className="hidden sm:flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-400 mb-6 sm:mb-8">
            <Link to="/" className="hover:text-primary-400 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary-400 transition-colors">Products</Link>
            <span>/</span>
            <Link to={`/products?category=${product.category}`} className="hover:text-primary-400 transition-colors">{product.category}</Link>
            <span>/</span>
            <span className="text-slate-400 truncate max-w-[220px] sm:max-w-sm md:max-w-md">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="bg-white p-3 sm:p-4 aspect-square overflow-hidden rounded-2xl">
                {showVideoInHero ? (
                  <video
                    src={product.videos?.[selectedVideo]?.url}
                    controls
                    playsInline
                    className="w-full h-full object-cover rounded-3xl"
                  />
                ) : (
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full  h-full object-cover rounded-3xl bg-white/5"
                  />
                )}
              </div>
              {(product.images?.length > 1 || hasVideos) && (
                <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === i ? 'border-primary-500' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img
                        src={getTransformedUrl(img.url, { width: 80, height: 80 })}
                        alt={`View ${i + 1}`}
                        className="w-full h-full object-contain bg-white/5"
                      />
                    </button>
                  ))}

                  {hasVideos && product.videos.map((v, i) => (
                    <button
                      key={v.public_id || i}
                      onClick={() => { setSelectedVideo(i); setActiveTab('videos') }}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        activeTab === 'videos' && selectedVideo === i ? 'border-primary-500' : 'border-white/10 hover:border-white/30'
                      }`}
                      title="Video"
                    >
                      <div className="w-full h-full bg-black/60 flex items-center justify-center text-white text-xs">
                        ▶ Video
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <span className="text-xs text-primary-600 font-bold uppercase tracking-wider">{product.category}</span>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-slate-900 mt-1 leading-tight break-words">
                  {product.name}
                </h1>

                {/* Rating */}
                {product.numReviews > 0 && (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < Math.floor(product.ratings) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                      ))}
                    </div>
                    <span className="text-slate-400 text-xs sm:text-sm">{product.ratings?.toFixed(1)} ({product.numReviews} reviews)</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="glass-card p-4 sm:p-5">
                <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-slate-800">Price: ₹{product.price?.toLocaleString('en-IN')}</span>
                  {product.originalPrice > product.price && (
                    <>
                     <span className="text-slate-500 text-sm sm:text-lg">MRP: </span> <span className="text-slate-500 line-through text-sm sm:text-lg">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                      <span className="badge bg-green-500/20 text-green-400 border border-green-500/30">{discount}% OFF</span>
                    </>
                  )}
                </div>
                <p className="text-slate-500 text-sm sm:text-lg">Inclusive of all taxes</p>
                {product.gstPercentage !== undefined && (
                  <p className="text-xs text-slate-400 mt-1">GST: {product.gstPercentage}%</p>
                )}
                {product.hsnCode && (
                  <p className="text-xs text-slate-400">HSN: {product.hsnCode}</p>
                )}
                <p className={`text-xs sm:text-sm mt-2 ${product.stock > 0 ? 'text-green-500' : 'text-red-400'}`}>
                  {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
                </p>
              </div>

              {/* Quantity */}
              <div>
                <label className="label">Quantity</label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 sm:w-10 sm:h-10 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 border-black/10 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-slate-800 font-bold text-base sm:text-lg w-10 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-9 h-9 sm:w-10 sm:h-10 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 border-black/10 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-row gap-2 sm:gap-3 relative z-[10]">
                <Button onClick={handleAddToCart} disabled={product.stock <= 0} className="flex flex-1 items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 text-white text-xs sm:text-base whitespace-nowrap px-2 sm:px-4">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span>Add to Cart</span>
                </Button>
                <Button 
                  onClick={() => {
                    if (product.stock <= 0) { toast.error('Out of stock'); return; }
                    const buyNowItem = { ...product, quantity };
                    if (!user) {
                      navigate('/login?redirect=checkout', { state: { buyNowItem } });
                    } else {
                      navigate('/checkout', { state: { buyNowItem } });
                    }
                  }} 
                  disabled={product.stock <= 0} 
                  className="flex flex-1 items-center justify-center py-3 sm:py-4 text-white text-xs sm:text-base whitespace-nowrap px-2 sm:px-4"
                >
                  <span>Buy Now</span>
                </Button>
                <button onClick={toggleWishlist} className="btn-secondary border-black/10 p-3 sm:p-4 flex items-center justify-center shrink-0" aria-label="Add to wishlist">
                  <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${isWishlisted ? 'text-red-400 fill-red-400' : 'text-black/30'}`} />
                </button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Truck, text: (Number(storeSettings.freeShippingThreshold) || 0) > 0 ? `Free Delivery over ₹${Number(storeSettings.freeShippingThreshold).toLocaleString('en-IN')}` : `Shipping ₹${Number(storeSettings.shippingCharge || 0).toLocaleString('en-IN')}` },
                  { icon: RefreshCw, text: '3 Day Returns' },
                  { icon: Shield, text: 'Secure Payment' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="glass-card p-3 flex flex-row sm:flex-col items-center gap-2 text-left sm:text-center">
                    <Icon className="w-5 h-5 text-primary-400 shrink-0" />
                    <span className="text-slate-600 text-xs leading-snug">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-16">
            <div className="flex gap-1 border-b border-white/10 mb-8 overflow-x-auto scrollbar-hide">
              {['description', 'specifications', 'product highlights', ...(product.videos?.length ? ['videos'] : [])].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-400'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="glass-card p-4 sm:p-6 overflow-hidden">
                <div className="space-y-6">
                  {dimensions ? (
                   <section className="mt-6">
                     <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                       <Ruler className="w-5 h-5 text-primary-500" />
                       Dimensions
                     </h3>
                   
                     <table className="w-full text-sm table-fixed">
                       <tbody>
                         {dimensionRows.map(({ label, value, unit }, i) => (
                           <tr key={i} className="table-row border-b border-slate-100 last:border-b-0">
                             <td className="py-3 pr-4 sm:pr-6 text-black font-bold w-1/3 pl-3 break-words align-top">
                               {label}
                             </td>
                   
                             <td className="py-3 text-slate-600 break-words">
                               {value !== null && value !== undefined
                                 ? `${formatEditableNumber(value)} ${unit}`
                                 : "Not Available"}
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </section>
                  ) : (
                    <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                      <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-primary-500" />
                        Dimensions
                      </h3>
                      <p className="mt-4 text-sm text-slate-500">Dimensions Not Available</p>
                    </section>
                  )}

                  {product.specifications?.length > 0 ? (
                    <table className="w-full text-sm table-fixed">
                      <tbody>
                        {product.specifications.map((spec, i) => (
                          <tr key={i} className="table-row ">
                            <td className="py-3 pr-4 sm:pr-6 text-black font-bold w-1/3 pl-3 break-words align-top">{spec.key}</td>
                            <td className="py-3 text-slate-600 break-words">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-slate-500">No specifications available.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="glass-card p-4 sm:p-6">
                {product.videos?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.videos.map((v, i) => (
                      <div key={v.public_id || i} className="rounded-2xl overflow-hidden border border-white/10 bg-black/30">
                        <video
                          src={v.url}
                          controls
                          playsInline
                          className="w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No videos available.</p>
                )}
              </div>
            )}

            {activeTab === 'product highlights' && (
              <div className="glass-card p-4 sm:p-6">
                {highlights.length > 0 ? (
                  <ul className="space-y-3">
                    {highlights.map((highlight, i) => (
                      <li key={`${highlight}-${i}`} className="flex gap-3 text-slate-600">
                        <span className="mt-2 h-2 w-2 rounded-full bg-primary-400 shrink-0" />
                        <span className="break-words">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">No highlights available.</p>
                )}
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="mt-16">
            <h2 className="section-title text-slate-800 mb-8">Reviews</h2>
            <div>
                {product.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((review, i) => (
                      <div key={i} className="glass-card p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
                              <span className="text-primary-400 text-sm font-bold">{review.name?.[0]}</span>
                            </div>
                            <div>
                              <p className="text-slate-800 font-medium text-sm">{review.name}</p>
                              <p className="text-slate-500 text-xs">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No reviews yet. Be the first to review this product!</p>
                )}

                <div className="mt-8 glass-card p-4 sm:p-6">
                  <h3 className="text-black font-semibold mb-4">Write a review</h3>
                  {!user ? (
                    <p className="text-slate-500 text-sm">Please login to add a review.</p>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="label">Rating</label>
                        <select
                          className="input-field"
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                        >
                          {[5, 4, 3, 2, 1].map(v => (
                            <option key={v} value={v}>{v} Star{v > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label">Comment</label>
                        <textarea
                          className="input-field resize-none h-28"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience…"
                        />
                      </div>
                      <Button type="submit" loading={reviewSubmitting} className="justify-center text-white py-3 w-full">
                        Submit Review
                      </Button>
                    </form>
                  )}
                </div>
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div className="mt-16">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
                <div>
                  <h2 className="section-title text-slate-800">Related Products</h2>
                  <p className="text-slate-500 text-sm mt-1">More in {product.category}</p>
                </div>
                <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="btn-ghost text-black/60 hover:text-black text-sm w-fit">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-5 lg:gap-6">
                {related.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
