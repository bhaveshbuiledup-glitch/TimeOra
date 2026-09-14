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
