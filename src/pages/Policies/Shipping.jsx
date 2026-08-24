import PolicyLayout from './PolicyLayout.jsx'

export default function Shipping() {
  return (
    <PolicyLayout
      title="Shipping & Delivery Policy"
      subtitle="Delivery timelines, tracking, and shipment handling."
    >
      <p><strong>Last updated:</strong> May 13, 2026</p>

      <h2>1. Shipping Partner</h2>
      <p>
        We use trusted courier partners to ship orders. Availability depends on delivery coverage for your pincode.
      </p>

      <h2>2. Processing Time</h2>
      <p>
        Orders are typically processed within 1–2 business days (excluding Sundays and public holidays),
        unless stated otherwise on the product page.
      </p>

      <h2>3. Delivery Time</h2>
      <p>
        Delivery timelines vary by location and courier performance. Estimated timelines shown at checkout are indicative.
      </p>

      <h2>4. Tracking</h2>
      <p>
        Once shipped, tracking details (AWB/tracking number) will be available in your Orders page when provided by the courier.
      </p>

      <h2>5. Shipping Charges</h2>
      <p>Shipping charges (if any) are displayed at checkout before you place the order.</p>

      <h2>6. Delivery Attempts</h2>
      <p>
        Courier partners may attempt delivery multiple times. If delivery fails due to incorrect address/phone or unavailability,
        the shipment may be returned to origin.
      </p>

      <h2>7. Damaged / Missing Items</h2>
      <p>
        If your package arrives damaged or items are missing, contact support within 48 hours of delivery with photos and order details.
      </p>
    </PolicyLayout>
  )
}
