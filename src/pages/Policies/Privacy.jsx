import PolicyLayout from './PolicyLayout.jsx'

export default function Privacy() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your information."
    >
      <p className="text-black"><strong>Last updated:</strong> May 13, 2026</p>

      <h2 className="text-black">1. Information We Collect</h2>
      <ul className="text-black">
        <li><strong>Account info:</strong> name, email, phone (if provided)</li>
        <li><strong>Order info:</strong> shipping address, purchased items, order history</li>
        <li><strong>Usage data:</strong> pages visited, device/browser information (basic analytics)</li>
      </ul>

      <h2 className="text-black">2. How We Use Your Information</h2>
      <ul className="text-black">
        <li>To create and manage your account</li>
        <li>To process orders, payments, and deliveries</li>
        <li>To provide customer support and communicate order updates</li>
        <li>To improve our website and services</li>
      </ul>

      <h2 className="text-black">3. Payments (Razorpay)</h2>
      <p className="text-black">
        Payments are processed by Razorpay. Sensitive payment information (such as full card details) is handled by Razorpay
        and is not stored on Arsh Mart servers.
      </p>

      <h2 className="text-black">4. Shipping & Tracking</h2>
      <p className="text-black">
        For shipping and delivery, we may share necessary information (such as name, address, phone, and order details)
        with courier partners to fulfill your order and provide tracking updates.
      </p>

      <h2 className="text-black">5. Cookies</h2>
      <p className="text-black">We may use cookies/local storage to keep you logged in and improve your browsing experience.</p>

      <h2 className="text-black">6. Data Security</h2>
      <p className="text-black">We take reasonable measures to protect your data. However, no system is 100% secure.</p>

      <h2 className="text-black">7. Data Retention</h2>
      <p className="text-black">We retain data as needed to provide services, comply with legal obligations, and resolve disputes.</p>

      <h2 className="text-black">8. Your Rights</h2>
      <p className="text-black">You can request access, correction, or deletion of your personal data, subject to legal requirements.</p>

      <h2 className="text-black">9. Contact</h2>
      <p className="text-black">For privacy-related requests, please contact our support team via the Contact page.</p>
    </PolicyLayout>
  )
}
