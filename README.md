# TIMEORA | Luxury Horlogerie E-Commerce Platform

Production-ready, single-brand full-stack e-commerce website for **TIMEORA** luxury watches.

---

## Brand Architecture & Customization

All brand information, taglines, color palettes, currencies, and contact details are centralized in a single configuration file for easy changes:

- **Frontend Brand Settings:** [`client/src/config/brandConfig.js`](client/src/config/brandConfig.js)
  - Change brand name: `name: "TIMEORA"`
  - Change tagline: `tagline: "Time That Defines You"`
  - Change currency: `currency: "$"`
  - Change colors: Champagne gold accents (`#c5a880`), dark midnight slate (`#0b0b0d`)

---

## Features & Pages Included

### 18 Complete Frontend Pages:
1. **Home (`/`)**: Cinematic luxury hero section, curated featured timepieces, collections showcase (Men & Women), horological craftsmanship pillars, collector testimonials, and VIP gazette newsletter.
2. **All Watches (`/watches`)**: Complete catalog grid with dynamic live filtering (Gender, Category, Maximum Price slider), instant keyword search, and sorting (Featured, Newest, Price Low-High, Price High-Low, Popularity).
3. **Men's Watches (`/men`)**: Pre-filtered masculine Haute Horlogerie chronographs and diver tools.
4. **Women's Watches (`/women`)**: Pre-filtered diamond-set, mother-of-pearl, and ultra-slim editions.
5. **New Arrivals (`/new-arrivals`)**: Latest releases from the Geneva atelier.
6. **Best Sellers (`/best-sellers`)**: The most celebrated and iconic timepieces.
7. **Product Details (`/product/:id`)**: Multi-angle image gallery with interactive thumbnail switching, pricing with discounts, color finish variant selector, detailed technical specifications table (movement, case, strap, water resistance, warranty), and related timepieces.
8. **Shopping Bag (`/cart`)**: Complete cart overview, coupon code redemption (`ROYAL10` for 10% privilege discount), line item controls, and subtotal calculation.
9. **Secure Checkout (`/checkout`)**: Dispatch address, courier selection (Express / Armored Priority), payment authorization (Credit Card, Bank Wire, Concierge COD).
10. **Order Success (`/order-success`)**: Order certification reference, delivery timeline, purchased items summary, and tracking prompt.
11. **Sign In (`/login`)**: Patron login with email/password validation and instant 1-click VIP Demo login.
12. **Register (`/register`)**: Patron registration with validation and account creation.
13. **Patron Account (`/account`)**: Collector tier status, recent order history, active warranties, and saved addresses.
14. **My Orders (`/orders`)**: Provenance tracking for past acquisitions with individual status indicators.
15. **About Us (`/about`)**: The heritage of TIMEORA, atelier philosophy, and standards of precision.
16. **Contact Us (`/contact`)**: Private horological concierge inquiry form and private viewing salon bookings.
17. **Wishlist (`/wishlist`)**: Curated personal favorites with 1-click move to shopping bag.
18. **404 Page (`*`)**: Bespoke "Lost in Time" luxury error page.

### Interactive Components & Overlays:
- **Slide-out Cart Drawer**: Instant slide-out review on adding items from any page.
- **Interactive Quick View Modal**: Preview specs and add to bag without leaving the listing page.
- **Live Search Overlay**: Instant keyboard search with keyword suggestions.
- **Fixed Luxury Navbar**: Dynamic backdrop blur on scroll, mobile drawer navigation, live item count badges.

---

## Tech Stack

### Frontend:
- **React 19** + **Vite 8**
- **Tailwind CSS v4** + `@tailwindcss/vite`
- **React Router 7**
- **Lucide React** (Vector icons)
- **Axios** (API requests)
- **Context API** (`CartContext`, `WishlistContext`, `AuthContext`)

### Backend:
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose** (with in-memory catalog fallback when offline)
- **JWT (JSON Web Tokens)** for authenticated sessions
- **bcryptjs** for secure password hashing
- **Multer** for product image uploads
- **CORS** + **dotenv**

---

## How to Run in VS Code

### 1. Run Frontend:
```bash
cd client
npm run dev
```
Open **http://localhost:5173** in your browser.

### 2. Run Backend Server:
```bash
cd server
node server.js
```
The API will run on **http://localhost:5000**.
Check server health at **http://localhost:5000/api/status**.

## AI Voice Support Setup

The voice feature is optional. It uses Twilio Voice for browser/phone audio and OpenAI Realtime for the AI conversation. Without credentials, website calls show that calling is unavailable and inbound phone requests return an unavailable response; no successful call is simulated. Product, stock, and price answers come from MongoDB. Order status requires the order reference, phone number, and postal code. The assistant only creates a COD order after the customer explicitly confirms the reviewed order.

### Install and configure

1. From the `watch-store` folder, install dependencies:

  ```bash
  npm install --prefix server
  npm install --prefix client
  ```

  `twilio` mints short-lived server-side Voice SDK tokens and validates Twilio webhook signatures. `ws` carries Twilio media to the server-side OpenAI Realtime connection. `@twilio/voice-sdk` handles website microphone calls.

2. Copy `server/.env.example` to `server/.env`. Keep all secrets only in this backend file. Fill in MongoDB/JWT values plus `OPENAI_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY_SID`, `TWILIO_API_KEY_SECRET`, `TWILIO_AUTH_TOKEN`, `TWILIO_VOICE_APP_SID`, and the public HTTPS base URL. Do not add these values to frontend variables or commit `server/.env`.

3. In Twilio Console, configure the Voice application Voice URL to `https://YOUR_PUBLIC_HOST/api/voice/twiml` using `POST`. Configure its call status callback as `https://YOUR_PUBLIC_HOST/api/voice/status` using `POST`. For incoming calls, assign a real Twilio voice number and set its Voice URL to the same `/api/voice/twiml` endpoint and status callback to `/api/voice/status`. Set `TWILIO_PHONE_NUMBER` to that assigned number. The backend will not accept phone-originated calls without it.

4. During local development, Twilio needs a public HTTPS tunnel to the backend on port 5000. Set `TWILIO_PUBLIC_BASE_URL` to that exact public base URL and configure Twilio webhooks to use it. The configured URL must match the URL Twilio signs. Production deployments must use HTTPS/WSS and a valid certificate.

5. Run the app from the `watch-store` folder:

  ```bash
  npm run server
  npm run client
  ```

  The server listens on `http://localhost:5000`; Vite prints the frontend URL (normally `http://localhost:5173`). Alternatively, `npm run dev` starts both.

6. Sign in with an admin account and open `/admin` to view call history, outcomes, handoff requests, voice-created orders, and configure greeting/languages. Call records do not include recordings or transcripts. Admin endpoints require the existing admin JWT.

### Admin sign-in and first-time setup

The **User** choice opens user sign-in. On that screen, choose **Create an account** to register; new registrations always receive the customer role. The **Admin** choice accepts an admin login ID or the admin account email.

To create or update the admin account locally, add `ADMIN_LOGIN_ID`, `ADMIN_EMAIL`, and a temporary `ADMIN_INITIAL_PASSWORD` to `server/.env` (an optional `ADMIN_NAME` sets the display name), then run from the `watch-store` folder:

```bash
npm run setup:admin --prefix server
```

The script hashes the password using the existing User model, will not promote a customer account, and prints no password. Remove `ADMIN_INITIAL_PASSWORD` from `server/.env` immediately after it reports success. Use a unique password and rotate any password that has been shared in chat; do not use a sample or previously disclosed password for a live store.

### Tests and compliance

Run backend voice tests with `npm test --prefix server` and build the frontend with `npm run build --prefix client` from `watch-store`.

This integration does not record calls or persist transcripts. Before putting live calls into service, confirm the applicable Indian telecom, privacy, AI disclosure, and consent obligations with your telephony provider and legal adviser. Confirm provider data residency/retention, required customer notice, permitted calling hours, number registration, and emergency/escalation procedures. A human handoff currently creates an admin-visible follow-up request; it does not transfer a live call to an agent.
