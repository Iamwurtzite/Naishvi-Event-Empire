/**
 * NAISHVI EVENT EMPIRE - Lightweight Local Server (Zero Dependencies)
 * Runs directly with Node.js without needing any npm install!
 * 
 * Usage:
 *   node dev-server.js
 * Opens at:
 *   http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const ROUTE_MAP = {
  '/': '/index.html',
  '/home': '/index.html',
  '/admin': '/admin.html',
  '/order': '/booking.html',
  '/booking': '/booking.html',
  '/customer': '/customer-dashboard.html',
  '/customer-dashboard': '/customer-dashboard.html',
  '/customer-portal': '/customer-portal.html',
  '/quotation': '/customer-portal.html',
  '/about': '/about.html',
  '/about-us': '/about.html',
  '/events': '/events.html',
  '/services': '/services.html',
  '/packages': '/packages.html',
  '/gallery': '/gallery.html',
  '/contact': '/contact.html',
  '/contact-us': '/contact.html',
  '/venues': '/venues.html',
  '/agra-venues': '/venues.html',
  '/music': '/music.html',
  '/pandit': '/pandit-services.html',
  '/pandit-services': '/pandit-services.html',
  '/calculator': '/budget-calculator.html',
  '/budget-calculator': '/budget-calculator.html',
  '/vendor': '/vendor-portal.html',
  '/vendor-portal': '/vendor-portal.html'
};

// Automatic 301 Redirect from legacy .html URLs to modern clean URLs
const REDIRECT_MAP = {
  '/index.html': '/',
  '/admin.html': '/admin',
  '/booking.html': '/order',
  '/customer-dashboard.html': '/customer',
  '/customer-portal.html': '/customer-portal',
  '/about.html': '/about',
  '/events.html': '/events',
  '/services.html': '/services',
  '/packages.html': '/packages',
  '/gallery.html': '/gallery',
  '/contact.html': '/contact',
  '/venues.html': '/venues',
  '/music.html': '/music',
  '/pandit-services.html': '/pandit',
  '/budget-calculator.html': '/calculator',
  '/vendor-portal.html': '/vendor'
};

const server = http.createServer((req, res) => {
  const urlParts = req.url.split('?');
  let reqPath = decodeURI(urlParts[0]);
  const queryString = urlParts[1] ? '?' + urlParts[1] : '';

  // Remove trailing slash if not root
  if (reqPath.length > 1 && reqPath.endsWith('/')) {
    reqPath = reqPath.slice(0, -1);
  }

  // 1. Redirect legacy .html URLs to modern clean URLs
  const lowerPath = reqPath.toLowerCase();
  if (REDIRECT_MAP[lowerPath]) {
    res.writeHead(301, {
      'Location': REDIRECT_MAP[lowerPath] + queryString,
      'Content-Type': 'text/plain'
    });
    return res.end();
  }

  // 2. Check Clean URL route map
  if (ROUTE_MAP[lowerPath]) {
    reqPath = ROUTE_MAP[lowerPath];
  }

  let filePath = path.join(ROOT_DIR, reqPath);

  // Security check: ensure path is within ROOT_DIR
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const dirIndex = path.join(filePath, 'index.html');
      if (fs.existsSync(dirIndex)) {
        filePath = dirIndex;
      } else {
        // Try appending .html
        const htmlPath = filePath + '.html';
        if (fs.existsSync(htmlPath)) {
          filePath = htmlPath;
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('404 Not Found: ' + reqPath);
        }
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('500 Internal Server Error');
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  🎊 ══════════════════════════════════════════════════════ 🎊');
  console.log('  ║                                                          ║');
  console.log('  ║       NAISHVI EVENT EMPIRE  —  Server is Running!        ║');
  console.log('  ║       Clean Modern URLs Active (No .html needed)         ║');
  console.log('  ║                                                          ║');
  console.log(`  ║       🌐  Home / Website:    http://localhost:${PORT}/           ║`);
  console.log(`  ║       🔐  Admin Desk:        http://localhost:${PORT}/admin      ║`);
  console.log(`  ║       📅  Book / Order:      http://localhost:${PORT}/order      ║`);
  console.log(`  ║       👤  Customer Track:    http://localhost:${PORT}/customer   ║`);
  console.log(`  ║       🤝  Vendor Portal:     http://localhost:${PORT}/vendor     ║`);
  console.log('  ║                                                          ║');
  console.log('  🎊 ══════════════════════════════════════════════════════ 🎊');
  console.log('');
  console.log('Press Ctrl + C to stop the server.');
});
