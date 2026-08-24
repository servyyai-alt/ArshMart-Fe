import PolicyLayout from './PolicyLayout.jsx'

export default function Terms() {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before using our website."
    >
      <p><strong>Last updated:</strong> May 13, 2026</p>

      <h2>1. About Arsh Mart</h2>
      <p>
        Arsh Mart (“we”, “our”, “us”) provides an online marketplace to browse and purchase products.
        By accessing or using this website, you agree to these Terms & Conditions.
      </p>

      <h2>2. Eligibility</h2>
      <p>You must be able to form a legally binding contract under applicable laws to use our services.</p>

      <h2>3. Accounts</h2>
      <ul>
        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
        <li>You agree to provide accurate and complete information.</li>
        <li>We may suspend accounts for suspected fraud, abuse, or policy violations.</li>
      </ul>

      <h2>4. Orders</h2>
      <ul>
        <li>Placing an order is an offer to purchase products subject to availability and confirmation.</li>
        <li>We reserve the right to cancel orders due to pricing errors, stock issues, or suspected fraud.</li>
      </ul>

      <h2>5. Pricing</h2>
      <p>All prices are shown in INR unless otherwise stated. Taxes and shipping charges (if any) are shown at checkout.</p>

      <h2>6. Payments (Razorpay)</h2>
      <p>
        Payments are processed via Razorpay or other supported payment partners. We do not store full card details on our servers.
        Payment confirmation is subject to verification by Razorpay and your bank/payment provider.
      </p>

      <h2>7. Shipping & Delivery</h2>
      <p>
        Shipping is fulfilled via courier partners. Delivery timelines are estimates and may vary due to weather,
        holidays, and operational constraints.
      </p>

      <h2>8. Returns, Refunds & Cancellations</h2>
      <p>Returns and refunds are governed by our Returns & Refunds Policy and Shipping Policy.</p>

      <h2>9. Intellectual Property</h2>
      <p>All content on this website (branding, images, text, UI) is owned by Arsh Mart or its licensors.</p>

      <h2>10. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Arsh Mart is not liable for indirect, incidental, or consequential damages.
      </p>

      <h2>11. Changes to These Terms</h2>
      <p>We may update these Terms from time to time. Continued use of the site means you accept the updated Terms.</p>

      <h2>12. Contact</h2>
      <p>If you have questions about these Terms, please contact our support team via the Contact page.</p>
    </PolicyLayout>
  )
}
