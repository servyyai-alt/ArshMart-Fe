import { runtimeConfig } from './runtime.js'

export const generateProductSchema = (product) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  image: product.images?.map((image) => image.url).filter(Boolean),
  description: product.description,
  sku: product.sku || product._id,
  brand: { '@type': 'Brand', name: product.brand || 'Arsh Mart' },
  offers: {
    '@type': 'Offer',
    url: `${runtimeConfig.siteUrl}/products/${product._id}`,
    priceCurrency: 'INR',
    price: product.price,
    itemCondition: 'https://schema.org/NewCondition',
    availability: product.stock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    seller: { '@type': 'Organization', name: 'Arsh Mart' },
  },
  aggregateRating: product.numReviews > 0 && product.ratings > 0 ? {
    '@type': 'AggregateRating',
    ratingValue: product.ratings,
    reviewCount: product.numReviews,
  } : undefined,
})

export const generateWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: runtimeConfig.appName,
  url: runtimeConfig.siteUrl,
  description: 'Premium online shopping destination in India',
  publisher: {
    '@type': 'Organization',
    name: runtimeConfig.appName,
    url: runtimeConfig.siteUrl,
    email: runtimeConfig.supportEmail,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'No.1286, 8th Cross Street, Poompuhar Nagar, Kolathur',
      addressLocality: 'Chennai',
      addressRegion: 'Tamil Nadu',
      postalCode: '600099',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: `+91${runtimeConfig.whatsappNumber}`,
      contactType: 'customer support',
      email: runtimeConfig.supportEmail,
    },
    sameAs: [runtimeConfig.instagramUrl].filter(Boolean),
  },
})

export const generateBreadcrumbSchema = (crumbs) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: `${runtimeConfig.siteUrl}${crumb.path}`,
  })),
})

export const defaultMeta = {
  title: 'Arsh Mart - Premium Shopping',
  description: 'Shop the best products at Arsh Mart. Electronics, Fashion, Home & Kitchen and more with fast delivery across India.',
  keywords: 'arsh mart, arshmart, online shopping, buy online, india ecommerce',
  ogImage: runtimeConfig.ogImageUrl,
}
