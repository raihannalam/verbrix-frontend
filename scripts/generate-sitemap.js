const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://verbrix.com';

// Update this to your actual production API domain if it differs
const API_URL = 'https://api.verbrix.com/api/v1/public/get-started-available-interpreters';

// The base static routes for the platform
const staticRoutes = [
  '',
  '/auth/login',
  '/auth/register',
  '/auth/password-reset', // Added missing password reset route
  '/how-it-works',
  '/interpreters/browse',
  '/about',
  '/legal/privacy',
  '/legal/terms',
  '/legal/deletion'
];

/**
 * Fetches all interpreter IDs from the paginated backend API.
 * Uses a recursive/while loop to ensure no pages are missed.
 */
async function fetchAllInterpreters() {
  let interpreterRoutes = [];
  let page = 0;
  let totalPages = 1;

  try {
    console.log('🔄 Fetching dynamic interpreter routes for sitemap...');

    while (page < totalPages) {
      // Fetching 100 per page to minimize API calls during the build process
      const response = await fetch(`${API_URL}?page=${page}&size=100`);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.content && Array.isArray(data.content)) {
        // Map the IDs into full route strings
        const currentRoutes = data.content.map(interpreter => `/interpreters/${interpreter.id}`);
        interpreterRoutes = interpreterRoutes.concat(currentRoutes);
      }

      // Spring Boot Pageable returns totalPages
      totalPages = data.totalPages || 1;
      page++;
    }

    console.log(`✅ Successfully fetched ${interpreterRoutes.length} interpreters.`);
    return interpreterRoutes;

  } catch (error) {
    // If the backend is down during CI/CD, we log the error but return an empty array
    // so the build doesn't fail entirely. It will still generate the static routes.
    console.error('⚠️ Warning: Failed to fetch dynamic interpreters. Falling back to static routes only.', error.message);
    return [];
  }
}

async function generateSitemap() {
  const dynamicRoutes = await fetchAllInterpreters();
  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  const today = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => {

    // Determine SEO priority based on route type
    const isHome = route === '';
    const isDynamicProfile = route.includes('/interpreters/') && route !== '/interpreters/browse';

    const priority = isHome ? '1.0' : isDynamicProfile ? '0.6' : '0.8';
    const changeFreq = isDynamicProfile ? 'monthly' : 'weekly';

    return `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('')}
</urlset>`;

  // The output path configured in your angular.json for the new application builder
  const distPath = path.join(__dirname, '../dist/verbrix-frontend/browser');

  // Ensure the directory exists before writing to prevent build crashes
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }

  const sitemapPath = path.join(distPath, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml);

  console.log('🚀 sitemap.xml generated successfully at:', sitemapPath);
}

// Execute
generateSitemap();
