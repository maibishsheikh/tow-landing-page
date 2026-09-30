/**
 * Vercel Serverless Function: Create Razorpay Order
 * Supports both Razorpay SDK and zero-dependency native fetch fallback.
 */

let Razorpay = null;
try {
  Razorpay = require('razorpay');
} catch (e) {
  // Graceful fallback to native fetch for zero-dependency deployment
}

module.exports = async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes('YOUR_KEY_ID')) {
      return res.status(500).json({
        error: 'Razorpay keys are not configured yet in environment variables',
        instruction: 'Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel project settings'
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { studentName, parentContact, grade, amount } = body;
    const orderAmount = (amount || 999) * 100; // in paise (₹999 = 99900 paise)

    const payload = {
      amount: orderAmount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        studentName: studentName || 'Student',
        parentContact: parentContact || '',
        grade: grade || 'All Grades',
        program: 'Tug of War Annual Enrollment'
      }
    };

    let orderId = null;

    if (Razorpay) {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });
      const order = await razorpay.orders.create(payload);
      orderId = order.id;
    } else {
      // Direct REST call to Razorpay API with Basic Auth
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const apiRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(payload)
      });

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        throw new Error(`Razorpay API responded with ${apiRes.status}: ${errText}`);
      }

      const order = await apiRes.json();
      orderId = order.id;
    }

    return res.status(200).json({
      success: true,
      orderId: orderId,
      amount: orderAmount,
      currency: 'INR',
      keyId: keyId
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    return res.status(500).json({
      error: 'Failed to create Razorpay order',
      details: err.message
    });
  }
};
