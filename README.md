# Intellia360: Tug of War Landing Page

Cloned from the Vedic Mathematics landing page and re-themed for Tug of War.

## Run
    npm install
    npm start        # http://localhost:3000  (or just open index.html)

## Firebase game access
1. In Firebase Console for `landing-page-2d2ea`, enable Google under Authentication > Sign-in method.
2. Add `localhost` and the deployed site hostname under Authentication > Settings > Authorized domains.
3. The web app configuration is in `js/firebase-config.js`. Firebase browser config values are public; access is enforced by Firebase Auth and the route guard.

The secure flow is: a game link checks the Firebase session, sends signed-out visitors to `/login?next=%2Fgame`, and returns signed-in visitors to `/game`. Direct visits to `/game` and the legacy `tug-of-war.html` game page are guarded too.

## Files
- `index.html`: home (hero, why, how a battle works, live rope demo, FAQ, CTA)
- `tug-of-war.html`: 6 stages, difficulty tiers, bot and 2-player, rewards, pricing
- `IMAGE_PROMPTS.md`: prompts for the 5 images in `assets/images/` (currently placeholders)
- `js/razorpay-config.js`: **price is a placeholder** (999 / 1999). Change it here and every price on the site updates.
