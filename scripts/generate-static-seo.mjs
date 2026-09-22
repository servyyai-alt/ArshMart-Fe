import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { loadEnv } from 'vite'

const env = { ...loadEnv('production', process.cwd(), ''), ...process.env }
const siteUrl = String(env.VITE_SITE_URL || env.VITE_APP_URL || 'https://arshmart.com').trim().replace(/\/+$/, '')
const apiUrl = String(env.SEO_API_URL || env.VITE_API_URL || '').trim().replace(/\/+$/, '')
const appName = env.VITE_APP_NAME || 'Arsh Mart'
const dist = resolve('dist')
const template = readFileSync(resolve(dist, 'index.html'), 'utf8')
writeFileSync(resolve(dist, 'spa.html'), template
  .replace(/<title>[^<]*<\/title>/, `<title>${appName}</title>`)
  .replace('</head>', '    <meta name="robots" content="noindex, follow">\n  </head>'), 'utf8')
const escapeXml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char])
const absolute = (path) => new URL(path, `${siteUrl}/`).href
const safeJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c')

const publicPages = [
  { path: '/', title: `${appName} | Online Shopping`, description: `Shop products at ${appName}. Browse the latest arrivals and discover everyday essentials.`, heading: `Shop at ${appName}` },
  { path: '/products', title: `All Products | ${appName}`, description: `Browse all products at ${appName}.`, heading: 'All Products' },
  { path: '/contact', title: `Contact Us | ${appName}`, description: `Contact ${appName} for help with orders, returns, shipping and payments.`, heading: 'Contact Us' },
  { path: '/shipping', title: `Shipping & Delivery Policy | ${appName}`, description: `Read the shipping and delivery policy at ${appName}.`, heading: 'Shipping & Delivery Policy' },
  { path: '/refunds', title: `Refunds & Returns | ${appName}`, description: `Read the refund and return policy at ${appName}.`, heading: 'Refunds & Returns' },
  { path: '/privacy', title: `Privacy Policy | ${appName}`, description: `Read the privacy policy at ${appName}.`, heading: 'Privacy Policy' },
  { path: '/terms', title: `Terms & Conditions | ${appName}`, description: `Read the terms and conditions at ${appName}.`, heading: 'Terms & Conditions' },
]

async function fetchCatalog() {
  if (!apiUrl) {
    console.warn('SEO_API_URL or VITE_API_URL is not set; product pages cannot be included in the sitemap.')
    return []
  }
  try {
    const products = []
    for (let page = 1; page <= 200; page += 1) {
      const endpoint = new URL(`${apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`}/products`)
      endpoint.searchParams.set('page', String(page))
      endpoint.searchParams.set('limit', '50')
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(8000) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      if (!Array.isArray(data.products)) throw new Error('Invalid product response')
      products.push(...data.products.filter((product) => product._id && product.isActive !== false))
      if (page >= Number(data.totalPages || 1)) break
      if (page === 200) throw new Error('Product catalog exceeded 200 pages')
    }
    return products
  } catch (error) {
    if (env.SEO_API_URL) throw new Error(`Product SEO generation failed: ${error.message}`)
    console.warn(`Product SEO generation skipped: ${error.message}`)
    return []
  }
}

function renderPage({ path, title, description, heading, image, schema, body = '', type = 'website' }) {
  const url = absolute(path)
  const imageUrl = image ? absolute(image) : absolute('/og-image.png')
  const meta = [
    `<title>${escapeXml(title)}</title>`,
    `<meta name="description" content="${escapeXml(description)}">`,
    '<meta name="robots" content="index, follow">',
    `<link rel="canonical" href="${escapeXml(url)}">`,
    `<meta property="og:type" content="${type}">`,
    `<meta property="og:site_name" content="${escapeXml(appName)}">`,
    '<meta property="og:locale" content="en_IN">',
    `<meta property="og:title" content="${escapeXml(title)}">`,
    `<meta property="og:description" content="${escapeXml(description)}">`,
    `<meta property="og:url" content="${escapeXml(url)}">`,
    `<meta property="og:image" content="${escapeXml(imageUrl)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeXml(title)}">`,
    `<meta name="twitter:description" content="${escapeXml(description)}">`,
    `<meta name="twitter:image" content="${escapeXml(imageUrl)}">`,
    ...(schema ? [`<script type="application/ld+json">${safeJson(schema)}</script>`] : []),
  ].map((tag) => tag.replace(/^<([a-z]+)/, '<$1 data-rh="true"')).join('\n    ')
  const html = template
    .replace(/^[ \t]*<title>[^<]*<\/title>\r?\n/m, '')
    .replace('</head>', `    ${meta}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root"><main><h1>${escapeXml(heading)}</h1><p>${escapeXml(description)}</p>${body}</main></div>`)
  const destination = path === '/' ? resolve(dist, 'index.html') : resolve(dist, path.slice(1), 'index.html')
  mkdirSync(dirname(destination), { recursive: true })
  writeFileSync(destination, html, 'utf8')
  if (path !== '/') writeFileSync(resolve(dist, `${path.slice(1)}.html`), html, 'utf8')
}

const products = await fetchCatalog()
const sitemapPaths = []
for (const page of publicPages) {
  const body = page.path === '/' || page.path === '/products'
    ? `<ul>${products.map((product) => `<li><a href="/products/${encodeURIComponent(product._id)}">${escapeXml(product.name)}</a></li>`).join('')}</ul>`
    : ''
  renderPage({ ...page, body })
  sitemapPaths.push({ path: page.path })
}

for (const product of products) {
  const path = `/products/${encodeURIComponent(product._id)}`
  const description = String(product.description || product.name).replace(/\s+/g, ' ').slice(0, 160)
  const image = product.images?.[0]?.url
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.map((item) => item.url).filter(Boolean),
    sku: product.sku || product._id,
    brand: { '@type': 'Brand', name: product.brand || appName },
    offers: {
      '@type': 'Offer',
      url: absolute(path),
      priceCurrency: 'INR',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(product.numReviews > 0 && product.ratings > 0 ? { aggregateRating: {
      '@type': 'AggregateRating', ratingValue: product.ratings, reviewCount: product.numReviews,
    } } : {}),
  }
  renderPage({
    path,
    title: `${product.name} | ${appName}`,
    description,
    heading: product.name,
    image,
    schema,
    type: 'product',
    body: `<p>₹${escapeXml(product.price)}</p>${image ? `<img src="${escapeXml(image)}" alt="${escapeXml(product.name)}">` : ''}<p><a href="/products">Browse products</a></p>`,
  })
  sitemapPaths.push({ path, lastmod: product.updatedAt })
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths.map(({ path, lastmod }) => `  <url><loc>${escapeXml(absolute(path))}</loc>${lastmod ? `<lastmod>${escapeXml(new Date(lastmod).toISOString().slice(0, 10))}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`
writeFileSync(resolve(dist, 'sitemap.xml'), sitemap, 'utf8')
writeFileSync(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\nDisallow: /profile\nDisallow: /orders\nDisallow: /returns\nDisallow: /wishlist\nDisallow: /cart\n\nSitemap: ${siteUrl}/sitemap.xml\n`, 'utf8')
console.log(`Generated ${sitemapPaths.length} sitemap URLs and ${products.length} product pages for ${siteUrl}`)
