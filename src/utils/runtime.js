const trimTrailingSlash = (value = '') => String(value || '').trim().replace(/\/+$/, '')

const normalizeApiBaseUrl = (value = '') => {
  const trimmed = trimTrailingSlash(value)
  if (!trimmed) return '/api'
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
}

const siteUrl = trimTrailingSlash(import.meta.env.VITE_SITE_URL || import.meta.env.VITE_APP_URL) || 'https://arshmart.com'

export const runtimeConfig = {
  appName: import.meta.env.VITE_APP_NAME || 'Arsh Mart',
  apiBaseUrl: normalizeApiBaseUrl(import.meta.env.VITE_API_URL),
  siteUrl,
  ogImageUrl: trimTrailingSlash(import.meta.env.VITE_OG_IMAGE_URL) || `${siteUrl}/og-image.png`,
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '8825696990',
  whatsappUrl: trimTrailingSlash(import.meta.env.VITE_WHATSAPP_URL || ''),
  instagramUrl: trimTrailingSlash(import.meta.env.VITE_INSTAGRAM_URL || ''),
  facebookUrl: trimTrailingSlash(import.meta.env.VITE_FACEBOOK_URL || ''),
  whatsappMessage: import.meta.env.VITE_WHATSAPP_MESSAGE || 'Thank you for choosing Arsh Mart. How can I help you?',
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'arshmart2127@gmail.com',
  businessAddress: import.meta.env.VITE_BUSINESS_ADDRESS || 'No.1286, 8th Cross Street, Poompuhar Nagar, Kolathur, Chennai - 600099',
}

export { normalizeApiBaseUrl, trimTrailingSlash }
