# CaLMoviE — GitHub Pages Deployment Guide
================================================

## 📁 Folder Structure
```
calmovie/                  ← upload this whole folder to GitHub
│
├── index.html             ← PUBLIC site (users see this)
├── css/
│   └── theme.css          ← shared styles for both pages
├── js/
│   └── config.js          ← shared logic + CFG data (edit prices here)
└── cx7admin/
    └── index.html         ← ADMIN PANEL (only you know this URL)
```

## 🚀 How to Deploy on GitHub Pages

1. Create a new GitHub repository (public or private)
2. Upload ALL files keeping the folder structure exactly as shown above
3. Go to: Settings → Pages → Source → Deploy from branch → main → / (root)
4. Your site will be live at:
   - **Public site:** `https://yourusername.github.io/calmovie/`
   - **Admin panel:** `https://yourusername.github.io/calmovie/cx7admin/`

## 🔐 Changing the Admin Password

Open `cx7admin/index.html` and find this line near the bottom:
```javascript
var ADMIN_PASSWORD = 'cinema2026';   /* ← CHANGE THIS */
```
Change `cinema2026` to any password you want.

## 💰 Changing Prices (Locked at 1500 / 1100 DA)

Prices are intentionally locked so the admin panel cannot accidentally change them.
To change them, open `js/config.js` and find:
```javascript
prices: {
  Pouf:     1500,   /* DA — locked */
  Standard: 1100    /* DA — locked */
},
```

## 🎬 Changing Movies / Dates (via Admin Panel)

1. Go to your admin URL: `https://yourusername.github.io/calmovie/cx7admin/`
2. Enter your password
3. Edit any field — movie name, date, poster URL, showtime, venue
4. Click **Save All Changes**

> Note: Since GitHub Pages is static, changes made in the admin panel only
> persist for your current browser session. To make permanent changes,
> edit `js/config.js` directly and push to GitHub.

## 🕵️ Security

- The admin folder name `cx7admin` is obscure — users won't guess it
- Password prompt protects it even if someone finds the URL
- No sensitive data is stored — all client-side only
- For stronger security, consider adding GitHub repo privacy

## 📱 QR Scanner

The scanner uses the browser's native BarcodeDetector API (works on Android Chrome,
Edge, and Safari 17+). On older browsers, a manual code entry field appears instead.
Best used on a mobile phone at the entrance.
