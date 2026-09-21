import brandLogo from '../assets/Logo.png'
import { runtimeConfig } from './runtime.js'

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const initiatePayment = async ({ amount, orderId, user, onSuccess, onFailure, onProcessing }) => {
  const token = localStorage.getItem('token')
  if (!token) {
    onFailure?.('Please log in again to continue checkout.')
    return
  }

  const loaded = await loadRazorpayScript()
  if (!loaded) {
    onFailure?.('Failed to load Razorpay SDK')
    return
  }

  try {
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    const requestJson = async (path, body) => {
      const response = await fetch(`${runtimeConfig.apiBaseUrl}${path}`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(body),
      })

      const payload = await response.json().catch(() => ({}))

      if (response.status === 401) {
        const message = payload?.message || payload?.detail || ''
        if (/invalid token|token expired|not authenticated|please log in/i.test(String(message))) {
          throw new Error('Session expired. Please log in again.')
        }
        throw new Error(message || 'Session expired. Please log in again.')
      }

      if (!response.ok) {
        const message = payload?.message || payload?.detail || `Request failed with status ${response.status}`
        throw new Error(message)
      }

      return payload
    }

    let keyId = null
    const keyRes = await fetch(`${runtimeConfig.apiBaseUrl}/payment/key`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })

    const keyPayload = await keyRes.json().catch(() => ({}))
    if (!keyRes.ok) {
      if (keyRes.status === 401) {
        const message = keyPayload?.message || ''
        if (/invalid token|token expired|not authenticated|please log in/i.test(String(message))) {
          onFailure?.('Session expired. Please log in again.')
          return
        }
      }
      console.warn('Could not fetch Razorpay key from backend:', keyPayload?.message || keyRes.status)
    }

    keyId = keyPayload?.keyId || runtimeConfig.razorpayKeyId
    if (!keyId) {
      onFailure?.('Payment configuration error: Razorpay key is missing')
      return
    }

    const data = await requestJson(
      '/payment/create-order',
      {
        amount,
        orderId,
        currency: 'INR',
      }
    )

    const options = {
      key: keyId,
      amount: data.amount,
      currency: data.currency,
      name: runtimeConfig.appName,
      description: `Purchase at ${runtimeConfig.appName}`,
      image: brandLogo,
      order_id: data.razorpayOrderId,
      handler: async (response) => {
        try {
          onProcessing?.('verifying')
          const verifyRes = await requestJson(
            '/payment/verify',
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            }
          )
          onSuccess?.(verifyRes)
        } catch (err) {
          onFailure?.(err.message)
        }
      },
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: user?.phone,
      },
      theme: {
        color: '#689f38',
      },
      modal: {
        ondismiss: () => onFailure?.('Payment cancelled'),
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  } catch (err) {
    onFailure?.(err?.message || 'Payment initiation failed')
  }
}
