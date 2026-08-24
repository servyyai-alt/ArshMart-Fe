import PolicyLayout from './PolicyLayout.jsx'
import { runtimeConfig } from '../../utils/runtime.js'

export default function Contact() {
  return (
    <PolicyLayout
      title="Contact Us"
      subtitle="We’re here to help with orders, returns, shipping, and payments."
    >
      <p className="text-black"><strong>Last updated:</strong> May 13, 2026</p>

      <h2 className="text-black">Support</h2>
      <ul className="text-black">
        <li><strong>Email:</strong> <a href={`mailto:${runtimeConfig.supportEmail}`} className="underline">{runtimeConfig.supportEmail}</a></li>
        <li><strong>Phone:</strong> +91 88256 96990</li>
        <li><strong>Address:</strong> {runtimeConfig.businessAddress}</li>
        <li>
          <strong>Instagram:</strong>{' '}
          <a href={runtimeConfig.instagramUrl} target="_blank" rel="noopener noreferrer" className="underline">
            @arsh_mart_
          </a>
        </li>
      </ul>

      <h2 className="text-black">Payments (Razorpay)</h2>
      <p className="text-black">
        If you see a payment error, share your order ID and payment reference (if any). Payments are processed via Razorpay.
      </p>

      <h2 className="text-black">Shipping</h2>
      <p className="text-black">
        For delivery and tracking issues, share your order ID and tracking number if available. Shipping is handled through our courier partners.
      </p>
    </PolicyLayout>
  )
}
