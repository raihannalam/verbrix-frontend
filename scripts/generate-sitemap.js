const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://verbrix.com';

const routes = [
  '',
  '/auth/login',
  '/auth/register',
  '/auth/password-reset',
  '/how-it-works',
  '/interpreters/browse',
  '/about',
  '/legal/privacy',
  '/legal/terms',
  '/legal/deletion'
];

const today = new Date().toISOString();

const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${routes.map(route => `
<url>
<loc>${BASE_URL}${route}</loc>
<lastmod>${today}</lastmod>
<changefreq>weekly</changefreq>
<priority>${route === '' ? '1.0' : '0.8'}</priority>
</url>
`).join('')}

</urlset>`;

const distPath = path.join(__dirname, '../dist/verbrix-frontend/browser');

if (!fs.existsSync(distPath)) {
  console.error('dist/browser folder missing:', distPath);
  process.exit(1);
}

fs.writeFileSync(path.join(distPath, 'sitemap.xml'), xml);

console.log('✅ sitemap.xml generated at:', distPath);
