module.exports = function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

  return res.status(200).json({
    status: 'online',
    isConfigured: !!(keyId && keySecret && !keyId.includes('YOUR_KEY_ID')),
    mode: process.env.PAYMENT_MODE || 'test',
    keyId: keyId ? `${keyId.substring(0, 10)}...` : 'not_set'
  });
};
