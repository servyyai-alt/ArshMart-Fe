import { useEffect, useState } from 'react'
import { Save, Key, Palette, Globe, Video, Image as ImageIcon, Trash2 } from 'lucide-react'
import AdminLayout from './AdminLayout.jsx'
import Button from '../../components/Button.jsx'
import toast from 'react-hot-toast'
import api from '../../utils/api.js'
import { uploadImage, uploadVideo, deleteAsset } from '../../utils/cloudinary.js'

function Section({ title, icon: Icon, children, sectionName, saving, onSave }) {
  return (
    <div className="glass-card1 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary-400" />
          </div>
          <h2 className="text-white font-semibold">{title}</h2>
        </div>
        <Button size="sm" loading={saving} onClick={(e) => { e.preventDefault(); onSave(sectionName) }}>
          <Save className="w-3.5 h-3.5" /> Save
        </Button>
      </div>
      {children}
    </div>
  )
}

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'Arsh Mart',
    siteDescription: 'Premium online shopping destination in India',
    primaryColor: '#689f38',
    razorpayKeyId: '',
    razorpayKeySecret: '',
    cloudinaryCloudName: '',
    cloudinaryApiKey: '',
    cloudinaryApiSecret: '',
    freeShippingThreshold: 499,
    shippingCharge: 49,
    freeShippingEnabled: true,
    marqueeTexts: '',
    couponCode: '',
    heroVideoUrl: '',
    heroVideoPublicId: '',
    heroImageUrl: '',
    heroImagePublicId: '',
    heroImages: [],
    heroCards: [],
    latestArrivalsTitle: 'Latest Arrivals',
    latestArrivalsDescription: 'Explore our newest collection',
    latestArrivalBanners: [],
    offerBannerBadge: 'Deal of the day',
    offerBannerTitle: 'Up to 50% off',
    offerBannerSubtitle: 'today only',
    offerBannerDescription: 'Handpicked favourites at unbeatable prices. Grab yours before the deal ends.',
    offerBannerPrice: '',
    offerBannerOriginalPrice: '',
    offerBannerCtaLabel: 'Grab the deal',
    offerBannerCtaLink: '/products?sort=discount',
    offerBannerImageUrl: '',
    offerBannerImagePublicId: '',
  })
  const [secrets, setSecrets] = useState({
    hasRazorpayKeySecret: false,
    hasCloudinaryApiSecret: false,
  })
  const [saving, setSaving] = useState(false)

  const set = (key, value) => setSettings(s => ({ ...s, [key]: value }))

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const { data } = await api.get('/admin/settings')
        const s = data?.settings
        if (!mounted || !s) return

        setSettings(prev => ({
          ...prev,
          siteName: s.general?.siteName ?? prev.siteName,
          siteDescription: s.general?.siteDescription ?? prev.siteDescription,
          freeShippingThreshold: s.general?.freeShippingThreshold ?? prev.freeShippingThreshold,
          shippingCharge: s.general?.shippingCharge ?? prev.shippingCharge,
          freeShippingEnabled: s.general?.freeShippingEnabled ?? prev.freeShippingEnabled,

          primaryColor: s.theme?.primaryColor ?? prev.primaryColor,

          marqueeTexts: (s.marketing?.marqueeTexts || []).join('\n'),
          couponCode: s.marketing?.couponCode ?? prev.couponCode,

          heroVideoUrl: s.homepage?.heroVideo?.url ?? prev.heroVideoUrl,
          heroVideoPublicId: s.homepage?.heroVideo?.publicId ?? prev.heroVideoPublicId,
          heroImageUrl: s.homepage?.heroImage?.url ?? prev.heroImageUrl,
          heroImagePublicId: s.homepage?.heroImage?.publicId ?? prev.heroImagePublicId,
          heroImages: Array.isArray(s.homepage?.heroImages) && s.homepage.heroImages.length
            ? s.homepage.heroImages
            : (s.homepage?.heroImage?.url ? [{ url: s.homepage.heroImage.url, publicId: s.homepage?.heroImage?.publicId || '' }] : prev.heroImages),
          heroCards: Array.isArray(s.homepage?.heroCards) ? s.homepage.heroCards : prev.heroCards,
          latestArrivalsTitle: s.homepage?.latestArrivals?.title ?? prev.latestArrivalsTitle,
          latestArrivalsDescription: s.homepage?.latestArrivals?.description ?? prev.latestArrivalsDescription,
          latestArrivalBanners: Array.isArray(s.homepage?.latestArrivalBanners) ? s.homepage.latestArrivalBanners : prev.latestArrivalBanners,
          offerBannerBadge: s.homepage?.offerBanner?.badge ?? prev.offerBannerBadge,
          offerBannerTitle: s.homepage?.offerBanner?.title ?? prev.offerBannerTitle,
          offerBannerSubtitle: s.homepage?.offerBanner?.subtitle ?? prev.offerBannerSubtitle,
          offerBannerDescription: s.homepage?.offerBanner?.description ?? prev.offerBannerDescription,
          offerBannerPrice: s.homepage?.offerBanner?.price ?? '',
          offerBannerOriginalPrice: s.homepage?.offerBanner?.originalPrice ?? '',
          offerBannerCtaLabel: s.homepage?.offerBanner?.ctaLabel ?? prev.offerBannerCtaLabel,
          offerBannerCtaLink: s.homepage?.offerBanner?.ctaLink ?? prev.offerBannerCtaLink,
          offerBannerImageUrl: s.homepage?.offerBanner?.image?.url ?? prev.offerBannerImageUrl,
          offerBannerImagePublicId: s.homepage?.offerBanner?.image?.publicId ?? prev.offerBannerImagePublicId,

          razorpayKeyId: s.integrations?.razorpay?.keyId ?? prev.razorpayKeyId,
          razorpayKeySecret: '',
          cloudinaryCloudName: s.integrations?.cloudinary?.cloudName ?? prev.cloudinaryCloudName,
          cloudinaryApiKey: s.integrations?.cloudinary?.apiKey ?? prev.cloudinaryApiKey,
          cloudinaryApiSecret: '',
        }))

        setSecrets({
          hasRazorpayKeySecret: Boolean(s.secrets?.hasRazorpayKeySecret),
          hasCloudinaryApiSecret: Boolean(s.secrets?.hasCloudinaryApiSecret),
        })
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load settings')
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleSave = async (section) => {
    setSaving(true)
    try {
      const { data } = await api.put('/admin/settings', settings)
      const s = data?.settings
      if (s?.secrets) {
        setSecrets({
          hasRazorpayKeySecret: Boolean(s.secrets?.hasRazorpayKeySecret),
          hasCloudinaryApiSecret: Boolean(s.secrets?.hasCloudinaryApiSecret),
        })
      }
      // Clear secret inputs after saving (backend stores only if non-empty)
      setSettings(prev => ({
        ...prev,
        razorpayKeySecret: '',
        cloudinaryApiSecret: '',
      }))
      toast.success(`${section} settings saved!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const saveHeroFields = async (next) => {
    const payload = {
      heroVideoUrl: next.heroVideoUrl,
      heroVideoPublicId: next.heroVideoPublicId,
      heroImageUrl: next.heroImageUrl,
      heroImagePublicId: next.heroImagePublicId,
      heroImages: next.heroImages,
      heroCards: next.heroCards,
      latestArrivalBanners: next.latestArrivalBanners,
      offerBanner: {
        badge: next.offerBannerBadge,
        title: next.offerBannerTitle,
        subtitle: next.offerBannerSubtitle,
        description: next.offerBannerDescription,
        price: next.offerBannerPrice,
        originalPrice: next.offerBannerOriginalPrice,
        ctaLabel: next.offerBannerCtaLabel,
        ctaLink: next.offerBannerCtaLink,
        image: {
          url: next.offerBannerImageUrl,
          publicId: next.offerBannerImagePublicId,
        },
      },
    }
    const { data } = await api.put('/admin/settings', payload)
    return data?.settings
  }

  const addLatestArrivalBanner = async (file) => {
    if (!file) return
    if ((settings.latestArrivalBanners || []).length >= 2) {
      toast.error('Maximum 2 banners allowed')
      return
    }
    setSaving(true)
    try {
      const res = await uploadImage(file, 'latest-arrivals')
      const title = prompt('Banner title:', '') || ''
      const description = prompt('Banner description:', '') || ''
      const to = prompt('Banner link (optional):', '/products') || '/products'
      const next = {
        ...settings,
        latestArrivalBanners: [
          ...(settings.latestArrivalBanners || []),
          { title, description, image: { url: res.url, publicId: res.public_id }, to },
        ],
      }
      setSettings(next)
      await saveHeroFields(next)
      toast.success('Banner added')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setSaving(false)
    }
  }

  const deleteLatestArrivalBannerAt = async (idx) => {
    const banner = (settings.latestArrivalBanners || [])[idx]
    if (!banner) return
    if (!confirm('Delete this banner?')) return
    setSaving(true)
    try {
      if (banner.image?.publicId) await deleteAsset(banner.image.publicId, 'image')
      const next = { ...settings, latestArrivalBanners: (settings.latestArrivalBanners || []).filter((_, i) => i !== idx) }
      setSettings(next)
      await saveHeroFields(next)
      toast.success('Banner deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setSaving(false)
    }
  }

  const addHeroCard = async (kind, file) => {
    if (!file) return
    if ((settings.heroCards || []).length >= 14) {
      toast.error('Maximum 14 cards allowed')
      return
    }
    setSaving(true)
    try {
      const res = kind === 'video' ? await uploadVideo(file, 'hero-cards') : await uploadImage(file, 'hero-cards')
      const title = prompt('Card title (optional):', '') || ''
      const nextCards =
        kind === 'video'
          ? [{ kind, url: res.url, publicId: res.public_id, title }, ...(settings.heroCards || []).filter(c => c.kind !== 'video')]
          : [{ kind, url: res.url, publicId: res.public_id, title }, ...(settings.heroCards || []).filter(c => c.kind !== 'image')]
      const next = {
        ...settings,
        heroCards: nextCards,
      }
      setSettings(next)
      await saveHeroFields(next)
      toast.success('Card added')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setSaving(false)
    }
  }

  const uploadOfferBannerImage = async (file) => {
    if (!file) return
    setSaving(true)
    try {
      const res = await uploadImage(file, 'homepage-offer')
      const next = {
        ...settings,
        offerBannerImageUrl: res.url,
        offerBannerImagePublicId: res.public_id,
      }
      setSettings(next)
      await saveHeroFields(next)
      toast.success('Offer image uploaded')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setSaving(false)
    }
  }

  const deleteOfferBannerImage = async () => {
    if (!settings.offerBannerImagePublicId) return
    if (!confirm('Delete the offer image?')) return
    setSaving(true)
    try {
      await deleteAsset(settings.offerBannerImagePublicId, 'image')
      const next = {
        ...settings,
        offerBannerImageUrl: '',
        offerBannerImagePublicId: '',
      }
      setSettings(next)
      await saveHeroFields(next)
      toast.success('Offer image deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setSaving(false)
    }
  }

  const deleteHeroCardAt = async (idx) => {
    const card = (settings.heroCards || [])[idx]
    if (!card) return
    if (!confirm('Delete this card?')) return
    setSaving(true)
    try {
      if (card.publicId) await deleteAsset(card.publicId, card.kind === 'video' ? 'video' : 'image')
      const next = { ...settings, heroCards: (settings.heroCards || []).filter((_, i) => i !== idx) }
      setSettings(next)
      await saveHeroFields(next)
      toast.success('Card deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setSaving(false)
    }
  }

  const handleHeroVideoUpload = async (file) => {
    if (!file) return
    setSaving(true)
    try {
      const res = await uploadVideo(file, 'hero')
      const next = {
        ...settings,
        heroVideoUrl: res.url,
        heroVideoPublicId: res.public_id,
      }
      setSettings(next)
      await saveHeroFields(next)
      toast.success('Hero video updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Video upload failed')
    } finally {
      setSaving(false)
    }
  }

  const handleHeroImageUpload = async (file) => {
    if (!file) return
    setSaving(true)
    try {
      const res = await uploadImage(file, 'hero')
      const next = {
        ...settings,
        heroImageUrl: res.url,
        heroImagePublicId: res.public_id,
        heroImages: [...(settings.heroImages || []), { url: res.url, publicId: res.public_id }],
      }
      setSettings(next)
      await saveHeroFields(next)
      toast.success('Hero image added')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Image upload failed')
    } finally {
      setSaving(false)
    }
  }

  const deleteHeroImageAt = async (idx) => {
    const img = (settings.heroImages || [])[idx]
    if (!img) return
    if (!confirm('Delete this hero image?')) return
    setSaving(true)
    try {
      if (img.publicId) await deleteAsset(img.publicId, 'image')
      const nextImages = (settings.heroImages || []).filter((_, i) => i !== idx)
      const next = {
        ...settings,
        heroImages: nextImages,
        heroImageUrl: nextImages[0]?.url || '',
        heroImagePublicId: nextImages[0]?.publicId || '',
      }
      setSettings(next)
      await saveHeroFields(next)
      toast.success('Hero image deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete image')
    } finally {
      setSaving(false)
    }
  }

  const deleteHeroVideo = async () => {
    if (!settings.heroVideoPublicId) return
    if (!confirm('Delete hero video?')) return
    setSaving(true)
    try {
      await deleteAsset(settings.heroVideoPublicId, 'video')
      const next = { ...settings, heroVideoUrl: '', heroVideoPublicId: '' }
      setSettings(next)
      await saveHeroFields(next)
      toast.success('Hero video deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete video')
    } finally {
      setSaving(false)
    }
  }

  const deleteHeroImage = async () => {
    if (!settings.heroImagePublicId) return
    if (!confirm('Delete hero image?')) return
    setSaving(true)
    try {
      await deleteAsset(settings.heroImagePublicId, 'image')
      const next = { ...settings, heroImageUrl: '', heroImagePublicId: '', heroImages: [] }
      setSettings(next)
      await saveHeroFields(next)
      toast.success('Hero image deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete image')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="Settings" subtitle="Configure your store">
      <div className="max-w-3xl space-y-6">
        {/* General */}
        <Section title="General" icon={Globe} sectionName="General" saving={saving} onSave={handleSave}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Site Name</label>
              <input className="input-field text-white" value={settings.siteName} onChange={e => set('siteName', e.target.value)} />
            </div>
            <div>
              <label className="label">Free Shipping Threshold (₹)</label>
              <input type="number" className="input-field text-white" value={settings.freeShippingThreshold} onChange={e => set('freeShippingThreshold', e.target.value)} />
            </div>
            <div>
              <label className="label">Shipping Charge (₹)</label>
              <input type="number" className="input-field text-white" value={settings.shippingCharge} onChange={e => set('shippingCharge', e.target.value)} min="0" />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between glass p-4 rounded-xl border border-white/10">
              <div>
                <p className="text-slate-200 text-sm font-medium">Enable Free Shipping</p>
                <p className="text-slate-500 text-xs mt-1">If disabled, shipping charge is always applied.</p>
              </div>
              <button
                type="button"
                onClick={() => set('freeShippingEnabled', !settings.freeShippingEnabled)}
                className={`w-12 h-7 rounded-full transition-all ${settings.freeShippingEnabled ? 'bg-primary-500' : 'bg-white/10'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white mx-1 transition-transform ${settings.freeShippingEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Site Description</label>
              <textarea className="input-field text-white resize-none h-20" value={settings.siteDescription} onChange={e => set('siteDescription', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Homepage Scrolling Offer Texts</label>
              <textarea
                className="input-field text-white resize-none h-24"
                placeholder={'One line per message\nExample: Special Offer: Get 10% Discounts for Online Payment (Razorpay)\nExample: Special Discount Get Rs.50 Off On Order Above Rs.1000. Please Apply this Coupon Code: \"special50\"'}
                value={settings.marqueeTexts}
                onChange={e => set('marqueeTexts', e.target.value)}
              />
              <p className="text-[11px] text-slate-500 mt-1">Shown as a right-to-left scrolling banner on the homepage.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Default Coupon Code (optional)</label>
              <input className="input-field text-white font-mono" placeholder="special50" value={settings.couponCode} onChange={e => set('couponCode', e.target.value)} />
            </div>
            <div>
              <label className="label">Latest Arrivals Title</label>
              <input className="input-field text-white" placeholder="Latest Arrivals" value={settings.latestArrivalsTitle} onChange={e => set('latestArrivalsTitle', e.target.value)} />
            </div>
            <div>
              <label className="label">Latest Arrivals Description</label>
              <input className="input-field text-white" placeholder="Explore our newest collection" value={settings.latestArrivalsDescription} onChange={e => set('latestArrivalsDescription', e.target.value)} />
              <p className="text-[11px] text-slate-500 mt-1">Long text will be truncated with “…” on the homepage.</p>
            </div>
          </div>
        </Section>

        {/* Latest Arrivals Banners */}
        <Section title="Latest Arrivals Banners" icon={ImageIcon} sectionName="Latest Arrivals Banners" saving={saving} onSave={handleSave}>
          <div className="glass p-4 rounded-xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-slate-200 text-sm font-medium">Promo banners (max 2)</p>
                <p className="text-[11px] text-slate-500 mt-1">Replaces the “HEALTH / HOODIES” banners on the homepage.</p>
              </div>
              <label className={`btn-secondary cursor-pointer ${saving || (settings.latestArrivalBanners || []).length >= 2 ? 'opacity-50 pointer-events-none' : ''}`}>
                Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={(e) => addLatestArrivalBanner(e.target.files?.[0])} disabled={saving} />
              </label>
            </div>

            {(settings.latestArrivalBanners || []).length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {settings.latestArrivalBanners.map((b, i) => (
                  <div key={b.image?.publicId || b.image?.url || i} className="relative rounded-xl overflow-hidden border border-white/10 bg-dark-900/30">
                    <img src={b.image?.url} alt="" className="w-full h-28 object-contain bg-white/5" />
                    <div className="p-2">
                      <div className="text-xs text-slate-200 line-clamp-1">{b.title || 'Banner'}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-2">{b.description || ''}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteLatestArrivalBannerAt(i)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-500/80 hover:bg-red-500 flex items-center justify-center"
                      title="Delete"
                      disabled={saving}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No banners uploaded yet.</p>
            )}
          </div>
        </Section>

        <Section title="Homepage Offer Banner" icon={ImageIcon} sectionName="Homepage Offer Banner" saving={saving} onSave={handleSave}>
          <div className="glass p-4 rounded-xl border border-white/10 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Badge Text</label>
                <input className="input-field text-white" value={settings.offerBannerBadge} onChange={e => set('offerBannerBadge', e.target.value)} placeholder="Deal of the day" />
              </div>
              <div>
                <label className="label">CTA Link</label>
                <input className="input-field text-white" value={settings.offerBannerCtaLink} onChange={e => set('offerBannerCtaLink', e.target.value)} placeholder="/products?sort=discount" />
              </div>
              <div>
                <label className="label">Title</label>
                <input className="input-field text-white" value={settings.offerBannerTitle} onChange={e => set('offerBannerTitle', e.target.value)} placeholder="Up to 50% off" />
              </div>
              <div>
                <label className="label">Subtitle</label>
                <input className="input-field text-white" value={settings.offerBannerSubtitle} onChange={e => set('offerBannerSubtitle', e.target.value)} placeholder="today only" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Description</label>
                <textarea className="input-field text-white resize-none h-24" value={settings.offerBannerDescription} onChange={e => set('offerBannerDescription', e.target.value)} placeholder="Handpicked favourites at unbeatable prices." />
              </div>
              <div>
                <label className="label">Deal Price (₹)</label>
                <input type="number" min="0" className="input-field text-white" value={settings.offerBannerPrice} onChange={e => set('offerBannerPrice', e.target.value)} placeholder="2999" />
              </div>
              <div>
                <label className="label">Original Price (₹)</label>
                <input type="number" min="0" className="input-field text-white" value={settings.offerBannerOriginalPrice} onChange={e => set('offerBannerOriginalPrice', e.target.value)} placeholder="5999" />
              </div>
              <div>
                <label className="label">CTA Label</label>
                <input className="input-field text-white" value={settings.offerBannerCtaLabel} onChange={e => set('offerBannerCtaLabel', e.target.value)} placeholder="Grab the deal" />
              </div>
              <div>
                <label className="label">Offer Image</label>
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="btn-secondary cursor-pointer">
                    Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadOfferBannerImage(e.target.files?.[0])} disabled={saving} />
                  </label>
                  <button type="button" className="btn-ghost" onClick={deleteOfferBannerImage} disabled={saving || !settings.offerBannerImagePublicId}>
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {settings.offerBannerImageUrl ? (
              <div className="rounded-xl overflow-hidden border border-white/10 bg-dark-900/30">
                <img src={settings.offerBannerImageUrl} alt="" className="w-full h-40 object-cover" />
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No offer image uploaded yet.</p>
            )}
          </div>
        </Section>

        {/* Homepage Media */}
        {/* <Section title="Homepage Media" icon={Video} sectionName="Homepage Media" saving={saving} onSave={handleSave}>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-primary-400" />
                  <p className="text-slate-200 text-sm font-medium">Hero Background Video</p>
                </div>
                <button
                  type="button"
                  onClick={deleteHeroVideo}
                  className="btn-ghost py-1.5 px-2.5 text-xs text-red-400 hover:text-red-300"
                  disabled={saving || !settings.heroVideoPublicId}
                  title="Delete video"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {settings.heroVideoUrl ? (
                <video src={settings.heroVideoUrl} className="mt-3 w-full rounded-xl border border-white/10" controls />
              ) : (
                <p className="text-slate-500 text-xs mt-3">No hero video uploaded.</p>
              )}
              <label className="mt-3 inline-flex items-center gap-2 btn-secondary cursor-pointer">
                Upload Video
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleHeroVideoUpload(e.target.files?.[0])}
                  disabled={saving}
                />
              </label>
              <p className="text-[11px] text-slate-500 mt-2">Upload a small MP4 for best performance.</p>
            </div>

            <div className="glass p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary-400" />
                  <p className="text-slate-200 text-sm font-medium">Hero Images (Slider)</p>
                </div>
                <button
                  type="button"
                  onClick={deleteHeroImage}
                  className="btn-ghost py-1.5 px-2.5 text-xs text-red-400 hover:text-red-300"
                  disabled={saving || !settings.heroImagePublicId}
                  title="Delete image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {settings.heroImages?.length ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {settings.heroImages.slice(0, 4).map((img, i) => (
                    <div key={img.publicId || img.url || i} className="relative rounded-xl overflow-hidden border border-white/10">
                      <img src={img.url} alt="" className="w-full h-24 object-cover" />
                      <button
                        type="button"
                        onClick={() => deleteHeroImageAt(i)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-500/80 hover:bg-red-500 flex items-center justify-center"
                        title="Delete"
                        disabled={saving}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  ))}
                  {settings.heroImages.length > 4 && (
                    <div className="flex items-center justify-center h-24 rounded-xl glass border border-white/10 text-slate-400 text-xs">
                      +{settings.heroImages.length - 4} more
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-xs mt-3">No hero image uploaded.</p>
              )}
              <label className="mt-3 inline-flex items-center gap-2 btn-secondary cursor-pointer">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleHeroImageUpload(e.target.files?.[0])}
                  disabled={saving}
                />
              </label>
              <p className="text-[11px] text-slate-500 mt-2">Upload multiple images to show as a slider on the homepage hero background.</p>
            </div>
          </div>
        </Section> */}

        {/* Homepage Hero Cards */}
        <Section title="Homepage Hero Cards" icon={ImageIcon} sectionName="Homepage Hero Cards" saving={saving} onSave={handleSave}>
          <div className="glass p-4 rounded-xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-slate-200 text-sm font-medium">Carousel cards (max 14)</p>
                <p className="text-[11px] text-slate-500 mt-1">The latest image replaces the first gallery tile in #ArshMart Moments. The uploaded video becomes the homepage hero video.</p>
              </div>
              <div className="flex gap-2">
                <label className={`btn-secondary cursor-pointer ${saving || (settings.heroCards || []).length >= 14 ? 'opacity-50 pointer-events-none' : ''}`}>
                  Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => addHeroCard('image', e.target.files?.[0])} disabled={saving} />
                </label>
                <label className={`btn-secondary cursor-pointer ${saving || (settings.heroCards || []).length >= 14 ? 'opacity-50 pointer-events-none' : ''}`}>
                  Upload Video
                  <input type="file" accept="video/*" className="hidden" onChange={(e) => addHeroCard('video', e.target.files?.[0])} disabled={saving} />
                </label>
              </div>
            </div>

            {(settings.heroCards || []).length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {settings.heroCards.map((c, i) => (
                  <div key={c.publicId || c.url || i} className="relative rounded-xl overflow-hidden border border-white/10 bg-dark-900/30">
                    {c.kind === 'video' ? (
                      <video src={c.url} className="w-full h-24 object-cover" muted playsInline />
                    ) : (
                      <img src={c.url} alt="" className="w-full h-24 object-cover" />
                    )}
                    <div className="p-2">
                      <div className="text-xs text-slate-200 line-clamp-1">{c.title || (c.kind === 'video' ? 'Video' : 'Image')}</div>
                      <div className="text-[11px] text-slate-500">{c.kind}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteHeroCardAt(i)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-500/80 hover:bg-red-500 flex items-center justify-center"
                      title="Delete"
                      disabled={saving}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No cards uploaded yet.</p>
            )}
          </div>
        </Section>

        <hr className='border border-white/20' />
        <p className='text-center text-white/80 text-2xl font-bold'>Advanced settings</p>

        {/* Theme */}
        {/* <Section title="Theme" icon={Palette} sectionName="Theme" saving={saving} onSave={handleSave}>
          <div>
            <label className="label">Primary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={settings.primaryColor} onChange={e => set('primaryColor', e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border border-white/10" />
              <input className="input-field font-mono" value={settings.primaryColor} onChange={e => set('primaryColor', e.target.value)} />
            </div>
            <p className="text-slate-500 text-xs mt-2">Changes require a rebuild to take effect.</p>
          </div>
        </Section> */}

        {/* Razorpay */}
        <Section title="Razorpay" icon={Key} sectionName="Razorpay" saving={saving} onSave={handleSave}>
          <div className="glass p-3 rounded-xl mb-4">
            <p className="text-xs text-slate-400">
              🔒 Keys are stored securely on the server. Never expose your secret key in the frontend.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Key ID</label>
              <input className="input-field font-mono text-sm" placeholder="rzp_live_..." value={settings.razorpayKeyId} onChange={e => set('razorpayKeyId', e.target.value)} />
            </div>
            <div>
              <label className="label">Key Secret</label>
              <input type="password" className="input-field font-mono text-sm" placeholder="••••••••••••" value={settings.razorpayKeySecret} onChange={e => set('razorpayKeySecret', e.target.value)} />
              {secrets.hasRazorpayKeySecret && !settings.razorpayKeySecret && (
                <p className="text-[11px] text-slate-500 mt-1">A secret is already saved (leave blank to keep).</p>
              )}
            </div>
          </div>
        </Section>

        {/* Cloudinary */}
        <Section title="Cloudinary" icon={Key} sectionName="Cloudinary" saving={saving} onSave={handleSave}>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Cloud Name</label>
              <input className="input-field font-mono text-sm" value={settings.cloudinaryCloudName} onChange={e => set('cloudinaryCloudName', e.target.value)} />
            </div>
            <div>
              <label className="label">API Key</label>
              <input className="input-field font-mono text-sm" value={settings.cloudinaryApiKey} onChange={e => set('cloudinaryApiKey', e.target.value)} />
            </div>
            <div>
              <label className="label">API Secret</label>
              <input type="password" className="input-field font-mono text-sm" placeholder="••••••••" value={settings.cloudinaryApiSecret} onChange={e => set('cloudinaryApiSecret', e.target.value)} />
              {secrets.hasCloudinaryApiSecret && !settings.cloudinaryApiSecret && (
                <p className="text-[11px] text-slate-500 mt-1">A secret is already saved (leave blank to keep).</p>
              )}
            </div>
          </div>
        </Section>
      </div>
    </AdminLayout>
  )
}
