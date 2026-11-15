# NAISHVI EVENT EMPIRE
### WEDDINGS • EVENTS • DESTINATIONS
**"Your Dream Wedding, Our Responsibility."**

A complete, ultra-luxury, production-ready website and wedding management platform with real-time Google Sheets database integration and automated email dispatch.

---

## 🌟 Quick Start Guide

### Option 1: Double Click (Zero Installation Required)
Simply open the HTML files directly in any web browser:
1. **Public Website**: Open `index.html`
2. **Admin Desk**: Open `admin.html` (or browse to `/admin`)
3. **Customer Quotation & Portal**: Open `customer-portal.html` (or `/customer-portal`)
4. **Vendor Operations Desk**: Open `vendor-portal.html` (or `/vendor`)

### Option 2: Local Server (Windows Batch Launcher)
Double-click `start-server.bat` (or run `node dev-server.js`):
- **Website Home**: http://localhost:3000/
- **Admin Control Desk**: http://localhost:3000/admin
- **Booking & Order**: http://localhost:3000/order
- **Customer Tracker**: http://localhost:3000/customer
- **Vendor Desk**: http://localhost:3000/vendor

---


---

## 📊 Google Sheets & Email Integration

The platform integrates directly with **Google Sheets** via **Google Apps Script Webhook** (`google-sheets-script.js`).

1. Open **Google Sheets** and create a new spreadsheet.
2. Go to **Extensions > Apps Script**, paste the code from `google-sheets-script.js`.
3. Click **Deploy > New Deployment > Web App** (Access: Anyone).
4. Copy the deployment URL (`https://script.google.com/macros/s/.../exec`).
5. In the Admin Panel, paste the URL into **Google Sheets Webhook URL** and click **Save**.
6. Enter comma-separated notification emails (e.g. `naishvieventempire@gmail.com`) and click **Save Emails**.

All website bookings auto-append to the Google Sheet and trigger instant email notifications!

---

## 🚀 GitHub Pages Deployment

The repository is configured for direct deployment to GitHub Pages (e.g., `https://iamwurtzite.github.io/bussiness-website/`):
- `.nojekyll` prevents GitHub Pages from ignoring asset directories.
- `404.html` handles SPA routing and clean URL redirection without `.html`.
- Subdirectories (`about/`, `admin/`, `events/`, `order/`, `services/`, `gallery/`, etc.) provide direct clean URL resolution.

---

## 🛠️ Project Structure

```text
├── .nojekyll                 # GitHub Pages configuration
├── 404.html                  # Clean URL routing & fallback
├── index.html                # Main homepage
├── about.html & about/       # About Us page
├── events.html & events/     # Wedding & Ceremonies page
├── services.html & services/ # 18 Royal Services catalog
├── packages.html & packages/ # Tiered Wedding Packages
├── gallery.html & gallery/   # 6-Category Photo Portfolio
├── contact.html & contact/   # Contact Us & Consultation
├── booking.html & order/     # Multi-step Booking Engine
├── admin.html & admin/       # Admin Control Desk & Events Manager
├── dev-server.js             # Zero-dependency local dev server
├── start-server.bat          # 1-Click Windows launcher
├── google-sheets-script.js   # Google Apps Script Webhook code
├── package.json              # Clean project metadata
└── assets/
    ├── css/style.css         # Luxury Royal Black & Gold stylesheet
    ├── images/               # Official logo & photography assets
    ├── js/store.js           # Client-side store & database bridge
    ├── js/main.js            # UI interactions, wizard, duplicate check
    ├── js/admin.js           # Admin business suite & event management
    ├── js/customer.js        # Quotation & booking tracking
    └── js/vendor.js          # Vendor portal management
```

---

## 📜 Credits & Maintenance
- **Brand**: NAISHVI EVENT EMPIRE
- **Contact**: `naishvieventempire@gmail.com` | `+91 8279622416`
- **Developed by**: [Iamwurtzite](mailto:iamwurtzite@gmail.com?subject=Website%20Inquiry%20-%20Naishvi%20Event%20Empire)
