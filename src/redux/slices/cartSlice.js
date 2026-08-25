import { createSlice } from '@reduxjs/toolkit'

const CART_KEY = 'arshmart_cart'
const LEGACY_CART_KEY = 'sandhaikart_cart'

const getCartStateFromStorage = () => {
  try {
    const raw = localStorage.getItem(CART_KEY) || localStorage.getItem(LEGACY_CART_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (Array.isArray(parsed)) {
      return { items: parsed, coupon: null }
    }
    if (parsed && typeof parsed === 'object') {
      return {
        items: Array.isArray(parsed.items) ? parsed.items : [],
        coupon: parsed.coupon && typeof parsed.coupon === 'object' ? parsed.coupon : null,
      }
    }
    return { items: [], coupon: null }
  } catch {
    return { items: [], coupon: null }
  }
}

const saveCartStateToStorage = (items, coupon) => {
  localStorage.setItem(CART_KEY, JSON.stringify({ items, coupon }))
}

const initial = getCartStateFromStorage()

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: initial.items,
    shippingAddress: null,
    coupon: initial.coupon,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload
      const existing = state.items.find(i => i._id === product._id)
      if (existing) {
        existing.quantity += quantity
        if (existing.quantity > product.stock) existing.quantity = product.stock
      } else {
        state.items.push({ ...product, quantity })
      }
      saveCartStateToStorage(state.items, state.coupon)
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i._id !== action.payload)
      saveCartStateToStorage(state.items, state.coupon)
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.items.find(i => i._id === id)
      if (item) {
        item.quantity = quantity
        if (item.quantity <= 0) {
          state.items = state.items.filter(i => i._id !== id)
        }
      }
      saveCartStateToStorage(state.items, state.coupon)
    },
    clearCart: (state) => {
      state.items = []
      state.coupon = null
      saveCartStateToStorage([], null)
    },
    setShippingAddress: (state, action) => {
      state.shippingAddress = action.payload
    },
    applyCoupon: (state, action) => {
      const code = String(action.payload?.code || '').trim()
      const percent = Number(action.payload?.percent) || 0
      if (!code || percent <= 0) return
      state.coupon = { code, percent }
      saveCartStateToStorage(state.items, state.coupon)
    },
    clearCoupon: (state) => {
      state.coupon = null
      saveCartStateToStorage(state.items, null)
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart, setShippingAddress, applyCoupon, clearCoupon } = cartSlice.actions

// Selectors
export const selectCartTotal = (state) =>
  state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0)

export const selectCartCount = (state) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0)

export default cartSlice.reducer

