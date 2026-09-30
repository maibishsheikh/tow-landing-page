# Intellia360: Tug of War Landing Page

A fast, modern, and high-conversion landing page for **Tug of War: Math Battle**, featuring Razorpay payment checkout, interactive round demo, and full Vercel Serverless deployment readiness.

---

## 🚀 One-Click Vercel Deployment

This project is pre-configured with `vercel.json` and modular serverless functions in `/api` (`create-order`, `verify-payment`, `status`, `webhook`).

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Push your latest code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Deployment ready"
   git push origin main
   ```
2. Log in to [vercel.com](https://vercel.com) and click **"Add New..."** → **"Project"**.
3. Import your GitHub repository: `maibishsheikh/tow-landing-page`.
4. In **Project Settings**:
   - **Framework Preset**: Leave as *Other* (detected automatically).
   - **Root Directory**: `./`
   - **Build Command**: *None* (static files & serverless API).
   - **Output Directory**: *None*.
5. Expand **Environment Variables** and add:
   | Key | Example Value | Description |
   | :--- | :--- | :--- |
   | `RAZORPAY_KEY_ID` | `rzp_test_...` or `rzp_live_...` | Razorpay Merchant Key ID |
   | `RAZORPAY_KEY_SECRET` | `YOUR_SECRET_KEY` | Razorpay Merchant Secret Key |
   | `RAZORPAY_WEBHOOK_SECRET` | `YOUR_WEBHOOK_SECRET` *(optional)* | Secret for validating webhook signatures |
   | `PAYMENT_MODE` | `test` or `live` | Payment mode |
6. Click **Deploy**. Your site will be live on an edge-cached `*.vercel.app` URL within seconds!

---

### Option B: Deploy via Vercel CLI

1. Install the Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```
2. In the project root, run:
   ```bash
   vercel
   ```
3. Follow the CLI prompts to link and deploy to preview.
4. Deploy to production:
   ```bash
   vercel --prod
   ```
5. Set your environment variables in Vercel:
   ```bash
   vercel env add RAZORPAY_KEY_ID
   vercel env add RAZORPAY_KEY_SECRET
   ```

---

## 💻 Local Development

### Static Preview
Simply open `index.html` or `tug-of-war.html` in your browser.

### Full Node.js Server (with local API & Razorpay backend)
```bash
npm install
npm start
# Server runs on http://localhost:3000
```

---

## 📁 Project Architecture

- `index.html`: Home page (Hero, Why Tug of War, 5-step pathway, interactive rope demo, FAQ, CTA).
- `tug-of-war.html`: Game details (6 battle stages, 3 difficulty tiers, bot opponent, rewards, pricing).
- `vercel.json`: Edge caching, clean URLs, and serverless routing for Vercel.
- `api/`: Vercel Serverless Functions:
  - `create-order.js`: Creates authenticated Razorpay order with server-side keys.
  - `verify-payment.js`: Verifies HMAC-SHA256 signature for tamper-proof transactions.
  - `status.js`: API health check.
  - `webhook.js`: Real-time payment capture listener.
- `assets/images/`: Optimized high-resolution images (`hero_battle.jpg`, `cta_champion.jpg`, `tier_easy.jpg`, `tier_medium.jpg`, `tier_hard.jpg`).
- `css/style.css`: Clean, vanilla CSS design system with responsive layouts and micro-interactions.
- `js/script.js`: Vanilla JS interaction engine (navigation, modals, live rope simulator, checkout flow).
- `js/razorpay-config.js`: Single source of truth for pricing (₹999) and brand assets.
