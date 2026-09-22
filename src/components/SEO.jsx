import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { runtimeConfig } from '../utils/runtime.js'

export default function SEO({
  title = 'Arsh Mart - Premium Shopping',
  description = 'Shop the best products at Arsh Mart. Electronics, Fashion, Home & Kitchen and more.',
  keywords = 'arsh mart, arshmart, online shopping, buy online',
  ogImage = runtimeConfig.ogImageUrl,
  schema,
  noindex = false,
  canonicalPath,
  type = 'website',
}) {
  const { pathname, search } = useLocation()
  const fullTitle = title.includes(runtimeConfig.appName) ? title : `${title} | ${runtimeConfig.appName}`
  const canonicalUrl = new URL(canonicalPath || `${pathname}${search}`, `${runtimeConfig.siteUrl}/`).href
  const imageUrl = new URL(ogImage, `${runtimeConfig.siteUrl}/`).href
  const structuredData = schema ? JSON.stringify(schema).replace(/</g, '\\u003c') : null

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow'} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={runtimeConfig.appName} />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {schema && (
        <script type="application/ld+json">
          {structuredData}
        </script>
      )}
    </Helmet>
  )
}
