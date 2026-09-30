/**
 * ============================================================================
 * INTELLIA360 — SECURE RAZORPAY BACKEND SERVER
 * ============================================================================
 * 
 * This server provides:
 * 1. Static file hosting for the website (HTML, CSS, JS, Assets)
 * 2. POST /api/create-order -> Creates a verified Razorpay order with Key Secret
 * 3. POST /api/verify-payment -> Cryptographically verifies payment signature (HMAC-SHA256)
 * 4. POST /api/webhook -> Captures Razorpay server webhooks
 * ============================================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const Razorpay = require('razorpay');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static frontend files from current directory
app.use(express.static(path.join(__dirname)));

// Initialize Razorpay Instance
const keyId = process.env.RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

let razorpay = null;
if (keyId && keySecret && !keyId.includes('YOUR_KEY_ID')) {
  razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
  console.log('✓ Razorpay SDK initialized successfully with Key ID:', keyId);
} else {
  console.warn('⚠️ Razorpay credentials not yet set in .env file. Running in configuration mode.');
}

/**
 * 1. Health & Config Status Check
 */
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    isConfigured: !!(keyId && keySecret && !keyId.includes('YOUR_KEY_ID')),
    mode: process.env.PAYMENT_MODE || 'test',
    keyId: keyId ? `${keyId.substring(0, 10)}...` : 'not_set'
  });
});

/**
 * 2. Create Order API
 * Frontend calls this when student clicks "Complete Payment"
 */
app.post('/api/create-order', async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({
        error: 'Razorpay keys are not configured yet in .env file',
        instruction: 'Please add your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env'
      });
    }

    const { studentName, parentContact, grade, amount } = req.body;
    const orderAmount = (amount || 2999) * 100; // in paise (₹2,999 = 299900 paise)

    const options = {
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

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({
      error: 'Failed to create Razorpay order',
      details: err.message
    });
  }
});

/**
 * 3. Verify Payment Signature API
 * Securely verifies that the payment was processed by Razorpay without tampering
 */
app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, studentName, grade } = req.body;

    if (!keySecret) {
      return res.status(500).json({ error: 'RAZORPAY_KEY_SECRET is not set in .env' });
    }

    // Generate expected HMAC-SHA256 signature
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpay_signature) {
      console.log(`🎉 Payment Verified for student: ${studentName || 'Student'}, Payment ID: ${razorpay_payment_id}`);
      
      return res.json({
        success: true,
        message: 'Payment signature verified successfully! Enrollment confirmed.',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        studentName: studentName,
        grade: grade
      });
    } else {
      console.warn('❌ Signature mismatch detected!');
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature. Verification failed.'
      });
    }
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ error: 'Verification error', details: err.message });
  }
});

/**
 * 4. Razorpay Webhook Listener (Optional)
 * For capturing real-time payment capture events
 */
app.post('/api/webhook', (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    
    if (webhookSecret && signature) {
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSig) {
        return res.status(400).send('Invalid webhook signature');
      }
    }

    const event = req.body.event;
    console.log('📬 Webhook event received from Razorpay:', event);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload.payment.entity;
      console.log(`✓ Webhook: Payment captured for ${paymentEntity.amount / 100} INR. Payment ID: ${paymentEntity.id}`);
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Webhook processing error');
  }
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`
  =======================================================
  🚀 Intellia360 Tug of War Server Started
  📍 Running at: http://localhost:${PORT}
  💳 Razorpay Mode: ${process.env.PAYMENT_MODE || 'test'}
  🔑 Key ID Status: ${keyId ? 'Configured' : 'Missing (Set in .env)'}
  =======================================================
  `);
});
