const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://verbrix.com';

// Only static, verified public routes
const routes = [
  '',
  '/auth/login',
  '/auth/register',
  '/how-it-works',
  '/interpreters/browse',
  '/about',
  '/legal/privacy',
  '/legal/terms',
  '/legal/deletion'
];

const today = new Date().toISOString();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

// Using the path from your angular.json configuration
const distPath = path.join(__dirname, '../dist/verbrix-frontend/browser');

if (!fs.existsSync(distPath)) {
  console.error('❌ dist/browser folder missing. Ensure the build finished first:', distPath);
  process.exit(1);
}

try {
  fs.writeFileSync(path.join(distPath, 'sitemap.xml'), xml);
  console.log('✅ Static sitemap.xml generated at:', distPath);
} catch (err) {
  console.error('❌ Failed to write sitemap.xml:', err);
  process.exit(1);
}
