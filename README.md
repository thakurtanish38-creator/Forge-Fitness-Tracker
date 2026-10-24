# FORGE

## Run locally

1. Install Node.js.
2. Open this project folder in VS Code.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local URL printed by Vite (normally http://localhost:5173).

## Architecture and data

FORGE is a React 18 and Vite frontend. App screens and the shared visual system live in `src/App.jsx`; food data and serving-size calculations live in `src/data.js`; the local persistence adapter lives in `src/storage.js`. The app has no backend or cloud sync. Accounts, preferences, food logs, hydration entries, workout logs, and weigh-ins are stored in this browser's `localStorage` under `forge_v1`. New passwords are PBKDF2-hashed in the browser; legacy locally stored plaintext passwords are upgraded after a successful login. This remains a local prototype, not secure server-side authentication.

Nutrition values come from FORGE's expanded built-in reference list and are approximate estimates, not verified food-label data. Entries show the reference serving and selected gram amount; macro values scale with portion size. Workout energy is also an estimate. No nutrition API or external auth integration is configured. A backend/auth provider and a server-side nutrition API configuration would be required before values or accounts can be represented as verified or shared across devices.

The landing page, sign-in/sign-up, onboarding, and authenticated tracker share FORGE's navy/charcoal and electric-blue visual language while retaining the saved light/dark theme preference. Landing, dashboard, food, workout, progress and settings screens use locally stored Unsplash photography in `public/images/`; Lenis provides smooth landing-page mouse-wheel scrolling. Touch scrolling remains native; Lenis is disabled when reduced motion is enabled. Images include descriptive alt text and below-the-fold images load lazily. The source images were downloaded and verified locally; the official Unsplash license page was inaccessible during this audit, so verify individual asset terms before production use.

Hydration is stored as dated per-day millilitre entries, with legacy glass counts migrated as 250 ml per glass. The daily goal is user-configurable. Weight measurements store their date and value; charts only display recorded values in the selected date range. These records update immediately and persist locally, but do not synchronize across browsers or devices. Cross-device use requires a backend, authenticated sessions and user-scoped database access.
