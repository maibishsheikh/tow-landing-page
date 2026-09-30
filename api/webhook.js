const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const signature = req.headers['x-razorpay-signature'];
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    if (webhookSecret && signature) {
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(body))
        .digest('hex');

      if (signature !== expectedSig) {
        return res.status(400).send('Invalid webhook signature');
      }
    }

    const event = body.event;
    console.log('📬 Webhook event received from Razorpay:', event);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = body.payload?.payment?.entity;
      if (paymentEntity) {
        console.log(`✓ Webhook: Payment captured for ${paymentEntity.amount / 100} INR. Payment ID: ${paymentEntity.id}`);
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).send('Webhook processing error');
  }
};
