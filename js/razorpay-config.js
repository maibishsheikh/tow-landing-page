/**
 * ============================================================================
 * INTELLIA360 — RAZORPAY CONFIGURATION
 * ============================================================================
 * 
 * 📍 WHERE TO PASTE YOUR RAZORPAY CREDENTIALS:
 * 
 * 1. For direct website / frontend payments:
 *    Paste your "Merchant Key ID" in the `keyId` field below:
 *    - In Test Mode: starts with 'rzp_test_...'
 *    - In Live Mode: starts with 'rzp_live_...'
 * 
 * 2. If you are running the Node.js backend server (`server.js`):
 *    Paste your "Live Merchant Key Secret" and "Webhook Secret" in the `.env` file!
 * ============================================================================
 */

const RAZORPAY_CONFIG = {
  // Mode: Set to 'test' or 'live'
  mode: 'test',

  // 👉 PASTE YOUR MERCHANT KEY ID HERE:
  keyId: 'rzp_test_YOUR_KEY_ID_HERE',

  // Currency & Pricing (Amount in Indian Rupees)
  currency: 'INR',
  amount: 999, // PLACEHOLDER annual price in ₹. Change before launch.
  originalAmount: 1999, // Strike-through price shown on the page (placeholder)

  // Company / Brand details displayed in the Razorpay Checkout popup
  companyName: 'Intellia360',
  programName: 'Tug of War Annual Enrollment',
  logoUrl: 'assets/logo/intellia360-logo.png',
  themeColor: '#186fe9', // Intellia360 Brand Blue

  // Backend API URL (Automatically used if server.js is running)
  backendApiUrl: '/api'
};

// Export to window so script.js can access it globally
if (typeof window !== 'undefined') {
  window.RAZORPAY_CONFIG = RAZORPAY_CONFIG;
}
