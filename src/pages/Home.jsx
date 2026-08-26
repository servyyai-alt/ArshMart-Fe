import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  ChevronRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Headphones,
  Star,
  Sparkles,
  BadgeCheck,
  TrendingUp,
  Timer,
  Gift,
  Zap,
  Heart,
  Mail,
  ShoppingBag,
  CreditCard,
  Wallet,
  Banknote,
  Smartphone,
  Shirt,
  Home as HomeIcon,
  Dumbbell,
  BookOpen,
  Palette,
  Car,
  Apple,
  HeartPulse,
  Baby,
  UtensilsCrossed,
  Instagram,
} from "lucide-react";
import SEO from "../components/SEO.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { fetchFeaturedProducts } from "../redux/slices/productSlice.js";
import { generateWebsiteSchema } from "../utils/seo.js";
import api from "../utils/api.js";
import { runtimeConfig } from "../utils/runtime.js";
import bgVideo from "../assets/videos/bg-video.mp4";
import CountUpStat from "../components/CountUpStat.jsx";
import TestimonialsCarousel from "../components/TestimonialsCarousel.jsx";
import fashionImage from "../assets/images/fashion.jpg";
import ElectronicImage from "../assets/images/electronics.jpg";
import homeImage from "../assets/images/home.jpg";
import SportsImage from "../assets/images/sports.jpg";

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80";

const galleryFallback = [
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80",
];

const CATEGORY_GRADIENTS = [
  "from-[#9eb133] to-[#4c5f18]",
  "from-[#d1da97] to-[#728d24]",
  "from-[#728d24] to-[#3b4913]",
  "from-[#e5ecc4] to-[#728d24]",
  "from-[#5e771e] to-[#2f390f]",
  "from-[#b8c662] to-[#9eb133]",
];

const galleryLabels = [
  "Trending Now",
  "Fashion Picks",
  "Home Essentials",
  "Beauty Finds",
  "Tech Deals",
  "New Arrivals",
  "Featured",
  "Community Love",
];

const TICKER_ITEMS = [
  "Special Offer: Get 10% off for Online Payment",
  "Use coupon code WELCOME10 — Rs.50 off on orders above Rs.1000",
  "Free shipping on orders above ₹499 across India",
  "COD available · Easy 7-day returns",
  "New premium arrivals every week",
];

const HARDCODED_CATEGORIES = [
  { name: "Electronics", image: ElectronicImage },
  { name: "Fashion", image: fashionImage },
  { name: "Home & Kitchen", image: homeImage },
  { name: "Sports", image: SportsImage },
  {
    name: "Beauty",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Grocery",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
  },
];

const HARDCODED_DEAL = {
  _id: "showcase-deal",
  name: "Smart Noise-Cancelling Headphones",
  price: 2999,
  originalPrice: 5999,
  ratings: 4.9,
  stock: 25,
  images: [
    {
      url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
    },
  ],
};

const parseMoney = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const normalizeHomepageCards = (cards = []) =>
  (Array.isArray(cards) ? cards : [])
    .map((card) => ({
      kind: card?.kind === "video" ? "video" : "image",
      url: card?.url || "",
      title: card?.title || "",
      publicId: card?.publicId || "",
    }))
    .filter((card) => Boolean(card.url));

const DEFAULT_LATEST_ARRIVALS = [
  {
    title: "WELLNESS",
    description:
      "Start strong, stay strong — essentials for your everyday wellness.",
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    to: "/products?category=Beauty",
  },
  {
    title: "COMFORT WEAR",
    description:
      "Wear comfort. Live bold — street-ready fits, all day.",
    imageUrl:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
    to: "/products?category=Fashion",
  },
];

const CATEGORY_ICONS = {
  Electronics: Smartphone,
  Fashion: Shirt,
  "Home & Kitchen": HomeIcon,
  Sports: Dumbbell,
  Books: BookOpen,
  Beauty: Palette,
  Automotive: Car,
  Grocery: Apple,
  Health: HeartPulse,
  Toys: Baby,
  Kitchen: UtensilsCrossed,
};

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function SectionHeading({ eyebrow, title, subtitle, to, center = false }) {
  return (
    <div
      className={`${center ? "text-center" : "flex items-end justify-between gap-4"} mb-8`}
    >
      <div className={center ? "mx-auto max-w-2xl" : ""}>
        <div className={`section-eyebrow text-primary-600 ${center ? "justify-center" : ""}`}>
          <span className="h-px w-8 bg-primary-500" /> {eyebrow}
        </div>
        <h2 className="section-title text-[#152238] mt-2 text-3xl sm:text-4xl">
          {title}
        </h2>
        {subtitle && (
          <p className="text-slate-500 text-md mt-2">{subtitle}</p>
        )}
      </div>
      {to && !center && (
        <Link
          to={to}
          className="btn-outline text-sm px-5 py-2.5 shrink-0 group"
        >
          View all{" "}
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

function PromoBanner({ title, tagline, imageUrl, to, tone = 0 }) {
  const gradient =
    tone % 2 === 0
      ? "from-primary-950/75 via-primary-900/35 to-transparent"
      : "from-primary-900/70 via-primary-800/25 to-transparent";
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-3xl min-h-[200px] md:min-h-[240px] shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5"
    >
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="eager"
        decoding="async"
      />
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient}`} />
      <div className="relative p-7 md:p-9 h-full flex flex-col justify-between items-start">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-[11px] font-bold tracking-[0.18em] uppercase text-white ring-1 ring-white/20">
          <Sparkles className="w-3.5 h-3.5 text-primary-300" /> New Collection
        </div>
        <div>
          <div className="mt-3 text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-white drop-shadow-lg">
            {title}
          </div>
          <p className="mt-2 text-sm text-white/85 max-w-xs line-clamp-2">
            {tagline}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 shadow-lg transition-transform duration-300 group-hover:scale-105">
            Shop now <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function TickerStrip({ items }) {
  if (!items?.length) return null;
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-slate-100 bg-white py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />
      <div className="flex w-max animate-ticker gap-3">
        {doubled.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-full bg-primary-50 px-5 py-2.5 text-sm font-semibold text-primary-700 ring-1 ring-primary-100 whitespace-nowrap"
          >
            <BadgeCheck className="w-4 h-4 text-primary-600 flex-shrink-0" />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

function PremiumCategoryCard({ category, index, spanClass }) {
  const Icon = CATEGORY_ICONS[category.name] || ShoppingBag;
  const gradient = CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length];
  const imageUrl = category.image && category.image.trim ? category.image : null;

  return (
    <Link
      to={`/products?category=${encodeURIComponent(category.name)}`}
      className={`group relative overflow-hidden rounded-3xl bg-slate-100 ${spanClass} block`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={category.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 transition-transform duration-700 group-hover:scale-110`}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-primary-950/20 to-transparent" />

      {/* Icon chip */}
      <div className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-md ring-1 ring-white/25">
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
        <h3 className="text-white font-display font-bold text-xl md:text-2xl leading-tight drop-shadow">
          {category.name}
        </h3>
        <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-300 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          Shop now <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 ring-inset group-hover:ring-primary-400/40 transition-colors" />
    </Link>
  );
}

function DealOfDay({ offer, product }) {
  const endOfDay = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }, []);
  const { hours, minutes, seconds } = useCountdown(endOfDay);
  const pad = (n) => String(n).padStart(2, "0");

  const imageUrl = offer?.image?.url || offer?.imageUrl || product?.images?.[0]?.url || FALLBACK_HERO;
  const discount = product?.originalPrice && product?.price && product.originalPrice > product.price
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;
  const badge = offer?.badge || "Deal of the day";
  const title = offer?.title || "Up to 50% off";
  const subtitle = offer?.subtitle || "today only";
  const description =
    offer?.description ||
    "Handpicked favourites at unbeatable prices. When the clock hits zero, the deal is gone — grab yours before it does.";
  const ctaLabel = offer?.ctaLabel || "Grab the deal";
  const ctaLink = offer?.ctaLink || "/products?sort=discount";

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-100 via-white to-primary-50 ring-1 ring-primary-200 shadow-xl shadow-[rgba(114,141,36,0.10)]">
          <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-[#d1da97]/40 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-[#e5ecc4]/50 blur-3xl" />

          <div className="relative grid lg:grid-cols-2 items-stretch">
            {/* Content */}
            <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-500/10 text-primary-600 ring-1 ring-primary-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em]">
                <Timer className="w-4 h-4" /> {badge}
              </div>
              <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-primary-900 leading-tight">
                {title}{" "}
                <span className="bg-gradient-to-r from-[#728d24] to-[#5e771e] bg-clip-text text-transparent">
                  {subtitle}
                </span>
              </h2>
              <p className="mt-4 text-slate-600 max-w-md leading-relaxed">
                {description}
              </p>

              {/* Countdown */}
              <div className="mt-8 flex items-center gap-3">
                {[
                  { label: "Hours", value: pad(hours) },
                  { label: "Mins", value: pad(minutes) },
                  { label: "Secs", value: pad(seconds) },
                ].map((t) => (
                  <div
                    key={t.label}
                    className="flex flex-col items-center rounded-2xl bg-white ring-1 ring-primary-200 shadow-sm px-4 sm:px-5 py-3"
                  >
                    <span className="text-2xl sm:text-3xl font-bold text-primary-900 tabular-nums">
                      {t.value}
                    </span>
                    <span className="mt-1 text-[10px] uppercase tracking-widest text-primary-600">
                      {t.label}
                    </span>
                  </div>
                ))}
                <span className="ml-1 text-primary-600">
                  <Gift className="w-6 h-6 animate-float-slow" />
                </span>
              </div>

              {ctaLink && (
                <div className="mt-8 flex items-center gap-4">
                  <Link
                    to={ctaLink}
                    className="btn-primary text-white px-8 py-3.5 text-base shadow-lg shadow-[rgba(114,141,36,0.25)]"
                  >
                    {ctaLabel} <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/products"
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline"
                  >
                    Shop all deals
                  </Link>
                </div>
              )}
            </div>

            {/* Product card */}
            {product ? (
              <Link
                to="/products?sort=discount"
                className="group relative m-5 sm:m-8 lg:m-10 rounded-3xl overflow-hidden ring-1 ring-primary-200 shadow-lg"
              >
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full min-h-[280px] lg:min-h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/45 via-transparent to-transparent" />
                {discount > 0 && (
                  <span className="absolute top-4 left-4 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-primary-700 shadow-lg">
                    -{discount}%
                  </span>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <div className="inline-flex max-w-full flex-col gap-2 rounded-2xl bg-black/45 backdrop-blur-md px-4 py-3 ring-1 ring-white/10">
                    <div className="flex items-center gap-1 text-[#e5ecc4]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 fill-current"
                        />
                      ))}
                      <span className="ml-1 text-white/90 text-xs">
                        {product.ratings || 0}
                      </span>
                    </div>
                    <h3 className="text-white font-display font-semibold text-lg sm:text-xl line-clamp-1">
                      {offer?.title || product.name}
                    </h3>
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-white text-xl sm:text-2xl font-bold">
                        {offer?.priceText || `₹${product.price?.toLocaleString("en-IN")}`}
                      </span>
                      {product.originalPrice && (
                        <span className="text-white/70 line-through text-sm">
                          ₹{product.originalPrice?.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="relative m-5 sm:m-8 lg:m-10 rounded-3xl overflow-hidden min-h-[280px] lg:min-h-[420px] bg-gradient-to-br from-primary-800 to-primary-900">
                <img
                  src={FALLBACK_HERO}
                  alt="Deal of the day"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#d1da97]/20 text-[#f4f7e8] ring-1 ring-[#d1da97]/30 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em]">
                    <Zap className="w-4 h-4" /> Fresh deals loading
                  </div>
                  <h3 className="mt-3 text-white font-display font-bold text-2xl">
                    Something amazing is on the way
                  </h3>
                  <Link
                    to="/products"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 shadow-lg"
                  >
                    Explore products <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Subscribed! Watch your inbox for exclusive offers.");
    setEmail("");
  };
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-100 via-white to-primary-50 px-8 py-14 sm:px-14 text-center ring-1 ring-primary-200 shadow-xl shadow-[rgba(114,141,36,0.10)]">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#d1da97]/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#e5ecc4]/50 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#728d24] to-[#5e771e] text-white shadow-lg shadow-[rgba(114,141,36,0.30)]">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="mt-6 text-3xl sm:text-4xl font-display font-bold text-primary-900">
              Get the best deals, first
            </h2>
            <p className="mt-3 text-slate-600">
              Subscribe to our newsletter for exclusive discounts, early access
              to drops, and members-only offers.
            </p>
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full sm:max-w-sm rounded-2xl bg-white border border-primary-200 px-5 py-3.5 text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-shadow"
              />
              <button
                type="submit"
                className="btn-primary text-white py-3.5 px-8 rounded-2xl shadow-lg"
              >
                Subscribe <ArrowRight className="w-5 h-5" />
              </button>
            </form>
            <p className="mt-4 text-xs text-slate-500">
              No spam, unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const dispatch = useDispatch();
  const { featured, loading } = useSelector((state) => state.products);
  const [storeSettings, setStoreSettings] = useState({
    freeShippingThreshold: 400,
    shippingCharge: 40,
    freeShippingEnabled: true,
  });
  const [latestArrivalsSettings, setLatestArrivalsSettings] = useState({
    title: "Latest Arrivals",
    description: "Explore our newest collection",
    banners: DEFAULT_LATEST_ARRIVALS,
  });
  const [galleryTiles, setGalleryTiles] = useState(
    galleryFallback.map((url, index) => ({
      url,
      title: galleryLabels[index % galleryLabels.length],
      publicId: "",
    })),
  );
  const [homepageHeroCards, setHomepageHeroCards] = useState([]);
  const [homepageOffer, setHomepageOffer] = useState({
    badge: "Deal of the day",
    title: "Up to 50% off",
    subtitle: "today only",
    description:
      "Handpicked favourites at unbeatable prices. Grab yours before the deal ends.",
    ctaLabel: "Grab the deal",
    ctaLink: "/products?sort=discount",
    image: { url: "" },
    price: null,
    originalPrice: null,
  });
  const [heroVideoError, setHeroVideoError] = useState(false);
  const videoRef = useRef(null);

  const testimonials = useMemo(
    () => [
      {
        quote:
          "The product quality is consistently great and delivery is always on time. Clean UI, smooth checkout.",
        name: "Aarav S.",
        title: "Verified Customer",
        badge: "5★",
      },
      {
        quote:
          "Fast shipping and excellent packaging. Support team was quick to respond and super helpful.",
        name: "Meera K.",
        title: "Repeat Buyer",
        badge: "Support",
      },
      {
        quote:
          "Love the curated selection. The featured picks are genuinely useful and the pricing is fair.",
        name: "Vikram R.",
        title: "Premium Member",
        badge: "Value",
      },
      {
        quote:
          "Checkout with Razorpay was seamless. Orders page is clear and tracking updates are timely.",
        name: "Ananya P.",
        title: "Verified Customer",
        badge: "Smooth",
      },
      {
        quote:
          "Minimal design, great experience. Product cards are clean and the filters work perfectly.",
        name: "Rohit M.",
        title: "Power Shopper",
        badge: "UX",
      },
      {
        quote:
          "Returns were hassle-free. The team processed it quickly and kept me updated throughout.",
        name: "Sneha D.",
        title: "Verified Customer",
        badge: "Returns",
      },
    ],
    [],
  );

  useEffect(() => {
    dispatch(fetchFeaturedProducts());

    let mounted = true;
    const loadSettings = async () => {
      try {
        const res = await api.get("/settings");
        if (!mounted) return;

        const g = res.data.settings?.general;
        if (g) {
          setStoreSettings((prev) => ({
            ...prev,
            freeShippingThreshold: Number.isFinite(Number(g.freeShippingThreshold))
              ? Number(g.freeShippingThreshold)
              : prev.freeShippingThreshold,
            shippingCharge: Number.isFinite(Number(g.shippingCharge))
              ? Number(g.shippingCharge)
              : prev.shippingCharge,
            freeShippingEnabled:
              typeof g.freeShippingEnabled === "boolean"
                ? g.freeShippingEnabled
                : prev.freeShippingEnabled,
          }));
        }

        const homepage = res.data.settings?.homepage;
        const offer = homepage?.offerBanner;
        const arrivals = homepage?.latestArrivals;
        const heroCards = normalizeHomepageCards(homepage?.heroCards);
        const banners = Array.isArray(homepage?.latestArrivalBanners) && homepage.latestArrivalBanners.length
          ? homepage.latestArrivalBanners
          : DEFAULT_LATEST_ARRIVALS;

        setHomepageHeroCards(heroCards);

        try {
          const galleryRes = await api.get('/gallery?limit=8');
          const images = Array.isArray(galleryRes.data?.images) ? galleryRes.data.images : [];
          const nextTiles = galleryFallback.map((url, index) => ({
            url,
            title: galleryLabels[index % galleryLabels.length],
            publicId: "",
          }));

          images.slice(0, 8).forEach((image, index) => {
            if (!image?.url) return;
            nextTiles[index] = {
              url: image.url,
              title: image.caption || galleryLabels[index % galleryLabels.length],
              publicId: image.public_id || "",
            };
          });

          setGalleryTiles(nextTiles);
        } catch {
          setGalleryTiles(
            galleryFallback.map((url, index) => ({
              url,
              title: galleryLabels[index % galleryLabels.length],
              publicId: "",
            })),
          );
        }

        if (arrivals) {
          setLatestArrivalsSettings({
            title: arrivals.title || "Latest Arrivals",
            description: arrivals.description || "Explore our newest collection",
            banners,
          });
        } else {
          setLatestArrivalsSettings({
            title: "Latest Arrivals",
            description: "Explore our newest collection",
            banners,
          });
        }

        if (offer) {
          setHomepageOffer({
            badge: offer.badge || "Deal of the day",
            title: offer.title || "Up to 50% off",
            subtitle: offer.subtitle || "today only",
            description:
              offer.description ||
              "Handpicked favourites at unbeatable prices. Grab yours before the deal ends.",
            ctaLabel: offer.ctaLabel || "Grab the deal",
            ctaLink: offer.ctaLink || "/products?sort=discount",
            image: {
              url: offer.image?.url || offer.imageUrl || "",
            },
            price: parseMoney(offer.price),
            originalPrice: parseMoney(offer.originalPrice),
          });
        }
      } catch {
        // Leave defaults in place when settings are unavailable.
      }
    };

    loadSettings();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadSettings();
      }
    };

    window.addEventListener("focus", loadSettings);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      mounted = false;
      window.removeEventListener("focus", loadSettings);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [dispatch]);

  const heroVideoUrl = useMemo(() => {
    const videoCard = homepageHeroCards.find((card) => card.kind === "video" && card.url);
    return videoCard?.url || bgVideo;
  }, [homepageHeroCards]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    setHeroVideoError(false);
    v.load();
    const tryPlay = async () => {
      try {
        await v.play();
      } catch {
        setHeroVideoError(true);
      }
    };
    const t = setTimeout(tryPlay, 0);
    return () => clearTimeout(t);
  }, [heroVideoUrl]);

  useEffect(() => {
    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" },
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  const dynamicFeatures = useMemo(
    () => [
      {
        icon: Truck,
        title: storeSettings.freeShippingEnabled ? "Free Shipping" : "Shipping Charge",
        desc: storeSettings.freeShippingEnabled
          ? `On orders over ₹${storeSettings.freeShippingThreshold}`
          : `₹${storeSettings.shippingCharge}`,
      },
      { icon: ShieldCheck, title: "Secure Payment", desc: "Razorpay protected" },
      { icon: RefreshCw, title: "Easy Returns", desc: "3 day return policy" },
      { icon: Headphones, title: "24/7 Support", desc: "Always here for you" },
    ],
    [storeSettings],
  );

  const heroMedia = !heroVideoError;

  const bentoSpans = [
    "col-span-2 aspect-[16/10] lg:col-span-2 lg:aspect-[2/1.15]",
    "aspect-square lg:aspect-[1/1.15]",
    "aspect-square lg:aspect-[1/1.15]",
    "aspect-square lg:aspect-[1/1.15]",
    "aspect-square lg:aspect-[1/1.15]",
    "col-span-2 aspect-[16/10] lg:col-span-2 lg:aspect-[2/1.15]",
  ];

  const paymentMethods = [
    { icon: Wallet, label: "UPI" },
    { icon: CreditCard, label: "Cards" },
    { icon: Zap, label: "Net Banking" },
    { icon: Banknote, label: "COD" },
  ];

  const dealProduct = useMemo(
    () => ({
      ...HARDCODED_DEAL,
      price: parseMoney(homepageOffer.price) ?? HARDCODED_DEAL.price,
      originalPrice: parseMoney(homepageOffer.originalPrice) ?? HARDCODED_DEAL.originalPrice,
    }),
    [homepageOffer.price, homepageOffer.originalPrice],
  );

  return (
    <div className="bg-white">
      <SEO
        title="Arsh Mart – Premium Shopping"
        description="Discover amazing deals at Arsh Mart. Shop Electronics, Fashion, Home & Kitchen and more with fast delivery across India."
        schema={generateWebsiteSchema()}
      />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/80 via-white to-white" />
        <div className="absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute top-40 -left-40 h-[420px] w-[420px] rounded-full bg-primary-100/60 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:pt-32 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div data-reveal style={{ "--reveal-delay": "0ms" }}>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-600/10 text-primary-700 ring-1 ring-primary-600/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em]">
                <Sparkles className="w-4 h-4 text-primary-500" />
                Premium Online Marketplace
              </div>

              <h1 className="mt-6 font-display text-[42px] sm:text-6xl lg:text-[64px] font-extrabold leading-[1.05] tracking-tight text-[#152238]">
                Shop Smarter.
                <br />
                <span className="gradient-text">Live Premium.</span>
              </h1>

              <p className="mt-6 text-lg text-slate-600 max-w-lg leading-relaxed">
                Curated electronics, fashion, home essentials and more —
                delivered fast across India with secure payments and effortless
                returns.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  to="/products"
                  className="btn-primary text-white py-3.5 px-8 text-base shadow-lg shadow-[rgba(114,141,36,0.25)]"
                >
                  Shop Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/products" className="btn-outline text-base py-3.5 px-8">
                  Explore Categories
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2.5">
                    {[fashionImage, homeImage, ElectronicImage, SportsImage].map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                      />
                    ))}
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center gap-1 text-primary-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                      <span className="ml-1 font-bold text-slate-900">4.9</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">
                      25,000+ happy customers
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block h-10 w-px bg-slate-200" />
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <BadgeCheck className="w-5 h-5 text-primary-600" />
                  Genuine products, verified sellers
                </div>
              </div>
            </div>

            {/* Right: media composition */}
            <div
              className="relative"
              data-reveal
              style={{ "--reveal-delay": "120ms" }}
            >
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-[rgba(114,141,36,0.20)] ring-1 ring-slate-900/10 aspect-[4/3.4]">
                {heroMedia ? (
                  <video
                    ref={videoRef}
                    src={heroVideoUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    loop
                    autoPlay
                  />
                ) : (
                  <img
                    src={FALLBACK_HERO}
                    alt="Featured at Arsh Mart"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/40 via-transparent to-transparent" />
              </div>

              <div className="absolute -top-5 -left-5 sm:-left-8 animate-float-slow">
                <div className="flex items-center gap-3 rounded-2xl bg-white/90 backdrop-blur-md px-5 py-3.5 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5">
                  <div className="h-11 w-11 rounded-xl bg-primary-600/10 text-primary-700 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      Free Shipping
                    </div>
                    <div className="text-xs text-slate-500">
                      {storeSettings.freeShippingEnabled
                        ? `On orders over ₹${storeSettings.freeShippingThreshold}`
                        : "Available nationwide"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-3 sm:-right-8 animate-float-slower">
                <div className="rounded-2xl bg-white/90 backdrop-blur-md px-5 py-4 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-slate-900">4.9</span>
                    <div className="flex text-primary-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    12k+ verified reviews
                  </p>
                </div>
              </div>

              <div className="absolute top-6 right-6 animate-float-slower">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-600 text-white backdrop-blur px-4 py-2 text-xs font-semibold shadow-lg shadow-[rgba(114,141,36,0.30)]">
                  <TrendingUp className="w-4 h-4 text-primary-100" />
                  Trending Now
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ OFFER TICKER ============ */}
      <div data-reveal style={{ "--reveal-delay": "80ms" }}>
        <TickerStrip items={TICKER_ITEMS} />
      </div>

      {/* ============ CATEGORIES (BENTO) ============ */}
      <section className="py-16">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-reveal
        >
          <SectionHeading
            eyebrow="Browse by category"
            title="Shop by Category"
            subtitle="Curated collections for every side of life"
            to="/products"
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {HARDCODED_CATEGORIES.slice(0, 6).map((cat, i) => (
              <PremiumCategoryCard
                key={cat.name}
                category={cat}
                index={i}
                spanClass={bentoSpans[i] || "aspect-[1/1.15]"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============ DEAL OF THE DAY ============ */}
      <div data-reveal>
        <DealOfDay offer={homepageOffer} product={dealProduct} />
      </div>

      {/* ============ TRUST FEATURES ============ */}
      <section className="py-12">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-reveal
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {dynamicFeatures.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[rgba(114,141,36,0.10)] hover:border-primary-200"
              >
                <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[#728d24]/10 transition-transform duration-500 group-hover:scale-150" />
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#5e771e] to-[#728d24] shadow-lg shadow-[rgba(114,141,36,0.25)] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="mt-4 text-slate-900 font-semibold text-base font-display">
                    {title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ LATEST ARRIVALS ============ */}
      <section className="py-12">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-reveal
        >
          <SectionHeading
            eyebrow="Fresh drops"
            title={latestArrivalsSettings.title}
            subtitle={latestArrivalsSettings.description}
            to="/products"
          />
          <div className="grid md:grid-cols-2 gap-5">
            {latestArrivalsSettings.banners.map((b, idx) => (
              <PromoBanner
                key={b.image?.publicId || b.image?.url || b.imageUrl || idx}
                title={b.title || "Latest Arrival"}
                tagline={b.description || ""}
                to={b.to || "/products"}
                imageUrl={b.image?.url || b.imageUrl || FALLBACK_HERO}
                tone={idx}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED PRODUCTS ============ */}
      <section className="py-12">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-reveal
        >
          <SectionHeading
            eyebrow="Hand-picked for you"
            title="Featured Products"
            subtitle="The pieces our customers love most"
            to="/products?featured=true"
          />

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {featured.length ? (
                featured.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-slate-500">
                  No featured products right now — check back soon.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ============ STATS BAND ============ */}
      <section className="py-14">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-reveal
        >
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-100 via-white to-primary-50 px-8 py-14 ring-1 ring-primary-200 shadow-xl shadow-[rgba(114,141,36,0.10)]">
            <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#d1da97]/40 blur-3xl" />
            <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-[#e5ecc4]/50 blur-3xl" />
            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
              <div>
                <div className="text-4xl sm:text-5xl font-display font-extrabold text-primary-900">
                  <CountUpStat value={1000} suffix="+" />
                </div>
                <p className="mt-2 text-sm font-medium uppercase tracking-wider text-primary-600">
                  Products curated
                </p>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-display font-extrabold text-primary-900">
                  <CountUpStat value={25} suffix="k+" />
                </div>
                <p className="mt-2 text-sm font-medium uppercase tracking-wider text-primary-600">
                  Happy customers
                </p>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-display font-extrabold text-primary-900">
                  <CountUpStat value={50} suffix="k+" />
                </div>
                <p className="mt-2 text-sm font-medium uppercase tracking-wider text-primary-600">
                  Orders delivered
                </p>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-display font-extrabold text-primary-900">
                  4.9<span className="text-[#728d24]">★</span>
                </div>
                <p className="mt-2 text-sm font-medium uppercase tracking-wider text-primary-600">
                  Average rating
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ GALLERY ============ */}
      <section className="py-16 bg-gradient-to-b from-white to-primary-50/40">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-reveal
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <div className="section-eyebrow">
                <span className="h-px w-8 bg-primary-500" /> Real style, real happy
              </div>
              <h2 className="text-[#152238] mt-2 text-3xl sm:text-4xl font-display font-bold">
                #ArshMart Moments
              </h2>
              <p className="text-slate-500 mt-2 max-w-md">
                See what our community is loving — unwind with our latest finds
                and favorite picks from across the store.
              </p>
            </div>
            <a
              href={runtimeConfig.instagramUrl || "https://www.instagram.com/arsh_mart_"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800 sm:mb-1"
            >
              <Instagram className="w-4 h-4" /> View on Instagram
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[150px] sm:auto-rows-[190px] gap-3 md:gap-4">
            {galleryTiles.slice(0, 8).map((img, i) => (
              <Link
                key={img.publicId || img.url || i}
                to="/products"
                className={`group relative overflow-hidden rounded-2xl ring-1 ring-slate-900/5 shadow-sm ${
                  i === 0
                    ? "md:col-span-2 md:row-span-2"
                    : i === 3
                      ? "md:row-span-2"
                      : i === 5
                        ? "lg:col-span-2"
                        : ""
                } ${i === 7 ? "md:hidden" : ""}`}
              >
                <img
                  src={img.url}
                  alt={img.title || galleryLabels[i % galleryLabels.length]}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/60 via-primary-900/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* corner sparkle tag */}
                <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-primary-600 shadow-md opacity-0 -rotate-45 scale-75 transition-all duration-300 group-hover:opacity-100 group-hover:rotate-0 group-hover:scale-100">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>

                {/* caption reveal */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white ring-1 ring-white/30 backdrop-blur">
                    <Heart className="w-3 h-3 text-primary-300" />
                    {img.title || galleryLabels[i % galleryLabels.length]}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Instagram-style accent strip */}
          <div className="mt-6 flex items-center justify-center gap-3 text-xs text-slate-400">
            <span className="h-px w-10 bg-primary-200" />
            <Instagram className="w-4 h-4 text-primary-500" />
            <span>@arsh_mart_</span>
            <span className="h-px w-10 bg-primary-200" />
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-14 bg-gradient-to-b from-white to-primary-50/40">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-reveal
        >
          <SectionHeading
            center
            eyebrow="Loved by thousands"
            title="What Our Customers Say"
            subtitle="Real feedback from real shoppers across India"
          />
          <TestimonialsCarousel
            testimonials={testimonials}
            intervalMs={3500}
            cardsPerSlide={3}
          />
        </div>
      </section>

      {/* ============ NEWSLETTER ============ */}
      <Newsletter />

      {/* ============ CTA + PAYMENTS ============ */}
      <section className="pb-16">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5"
          data-reveal
        >
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-100 via-white to-primary-50 px-8 py-14 md:px-14 ring-1 ring-primary-200 shadow-xl shadow-[rgba(114,141,36,0.10)]">
            <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-primary-300/30 blur-3xl" />
            <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-500/15 text-primary-700 ring-1 ring-primary-500/30 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em]">
                  <Sparkles className="w-4 h-4 text-primary-500" /> Limited time
                </div>
                <h2 className="mt-5 text-3xl md:text-4xl font-display font-bold text-primary-900 leading-tight">
                  Get 10% off your first order
                </h2>
                <p className="mt-3 text-slate-600">
                  Sign up and use code{" "}
                  <span className="text-primary-700 font-mono font-bold">
                    WELCOME10
                  </span>{" "}
                  at checkout.
                </p>
              </div>
              <Link
                to="/register"
                className="btn-primary text-white py-4 px-9 text-base shrink-0"
              >
                Claim Offer <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Payment methods */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white px-6 py-5 shadow-sm shadow-slate-900/5">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <ShieldCheck className="w-5 h-5 text-primary-600" />
              100% secure & encrypted checkout
            </div>
            <div className="flex items-center gap-2.5">
              {paymentMethods.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 rounded-full bg-slate-50 ring-1 ring-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600"
                >
                  <Icon className="w-3.5 h-3.5 text-primary-600" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
