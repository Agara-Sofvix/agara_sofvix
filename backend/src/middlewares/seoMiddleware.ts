import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import Settings from '../models/Settings';

// Cache the HTML template in memory (reloaded in dev via env flag)
let htmlCache: string | null = null;

// Works in both ts-node (cwd = project root) and production dist (cwd = backend)
const FRONTEND_DIST = (() => {
    const cwd = process.cwd();
    // cwd is usually the workspace root when using nodemon from backend/ folder
    const fromCwd = path.join(cwd, '..', 'frontend', 'dist', 'index.html');
    const fromCwdDirect = path.join(cwd, 'frontend', 'dist', 'index.html');
    if (fs.existsSync(fromCwdDirect)) return fromCwdDirect;
    if (fs.existsSync(fromCwd)) return fromCwd;
    // Fallback: resolve relative to this file
    return path.resolve(__dirname, '..', '..', '..', 'frontend', 'dist', 'index.html');
})();

function loadHtml(): string {
    if (htmlCache && process.env.NODE_ENV === 'production') return htmlCache;
    try {
        htmlCache = fs.readFileSync(FRONTEND_DIST, 'utf-8');
        return htmlCache;
    } catch {
        return '';
    }
}

function escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildSchemaTags(seo: any, pageSeo: any, baseUrl: string, reqPath: string): string {
    const schemas: any[] = [];
    const schemaSettings = seo?.schemaSettings || {};

    // 1. Organization Schema
    if (schemaSettings.organizationEnabled) {
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: seo?.metaTitle?.split('–')[0]?.trim() || 'எழுத்திடு',
            url: baseUrl,
            logo: seo?.ogImage || `${baseUrl}/logo.png`,
            sameAs: Object.values(seo?.socialLinks || {}).filter(Boolean)
        });
    }

    // 2. Breadcrumb Schema
    if (schemaSettings.breadcrumbEnabled && reqPath !== '/') {
        const parts = reqPath.split('/').filter(Boolean);
        const itemListElement = [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: baseUrl
            }
        ];

        parts.forEach((part, index) => {
            const name = part.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            const url = `${baseUrl}/${parts.slice(0, index + 1).join('/')}`;
            itemListElement.push({
                '@type': 'ListItem',
                position: index + 2,
                name,
                item: url
            });
        });

        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement
        });
    }

    // 3. FAQ Schema
    if (schemaSettings.faqEnabled && schemaSettings.faqItems?.length > 0) {
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: schemaSettings.faqItems.map((item: any) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.answer
                }
            }))
        });
    }

    if (schemas.length === 0) return '';

    return `<script type="application/ld+json">\n    ${JSON.stringify(schemas.length === 1 ? schemas[0] : { '@context': 'https://schema.org', '@graph': schemas }, null, 4).replace(/\n/g, '\n    ')}\n    </script>`;
}

function buildMetaTags(seo: any, pageSeo: any, baseUrl: string, reqPath: string): string {
    const siteName = 'எழுத்திடு';
    const title = pageSeo?.title || seo?.metaTitle || `${siteName} – Tamil Typing Master`;
    const desc = pageSeo?.description || seo?.metaDescription || 'Learn and master Tamil typing with interactive games and exercises.';
    const kw = pageSeo?.keywords || seo?.metaKeywords || '';
    const ogTitle = seo?.ogTitle || title;
    const ogDesc = seo?.ogDescription || desc;
    const ogImg = seo?.ogImage || '';
    const twHand = seo?.twitterHandle || '';
    const gscId = seo?.googleSearchConsoleId || '';
    const canonicalUrl = `${baseUrl}${reqPath}`;

    const lines: string[] = [
        `<title>${escapeHtml(title)}</title>`,
        `<meta name="description" content="${escapeHtml(desc)}" />`,
        kw ? `<meta name="keywords" content="${escapeHtml(kw)}" />` : '',
        `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
        // Open Graph
        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
        `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
        `<meta property="og:title" content="${escapeHtml(ogTitle)}" />`,
        `<meta property="og:description" content="${escapeHtml(ogDesc)}" />`,
        ogImg ? `<meta property="og:image" content="${escapeHtml(ogImg)}" />` : '',
        // Twitter
        `<meta name="twitter:card" content="summary_large_image" />`,
        twHand ? `<meta name="twitter:site" content="${escapeHtml(twHand)}" />` : '',
        `<meta name="twitter:title" content="${escapeHtml(ogTitle)}" />`,
        `<meta name="twitter:description" content="${escapeHtml(ogDesc)}" />`,
        ogImg ? `<meta name="twitter:image" content="${escapeHtml(ogImg)}" />` : '',
        // GSC verification
        gscId ? `<meta name="google-site-verification" content="${escapeHtml(gscId)}" />` : '',
    ];

    // Build Schema
    const schemaTags = buildSchemaTags(seo, pageSeo, baseUrl, reqPath);
    if (schemaTags) lines.push(schemaTags);

    return lines.filter(Boolean).join('\n    ');
}

export async function seoMiddleware(req: Request, res: Response, next: NextFunction) {
    // Skip API, static assets, and sitemap/robots
    if (
        req.path.startsWith('/api') ||
        req.path.startsWith('/uploads') ||
        req.path.startsWith('/avatars') ||
        req.path === '/robots.txt' ||
        req.path === '/sitemap.xml' ||
        req.path.startsWith('/admin')
    ) {
        return next();
    }

    // Only handle GET requests for navigation
    if (req.method !== 'GET') return next();

    const html = loadHtml();
    if (!html || !html.includes('<!--SEO_INJECT-->')) {
        // Frontend not built yet or placeholder missing — pass through
        return next();
    }

    try {
        const settings = await Settings.findOne().lean();
        if (!settings) {
            // Serve plain HTML if settings are not found
            const plain = html.replace('<!--SEO_INJECT-->', `<title>எழுத்திடு</title>`);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(200).send(plain);
        }

        const seo = (settings as any)?.seo || {};
        const pagesSeo: any[] = (settings as any)?.pagesSeo || [];

        // Find matching per-page SEO entry
        const reqPath = req.path === '/' ? '/' : req.path.replace(/\/$/, ''); // normalise trailing slash
        const pageSeo = pagesSeo.find(p => p.path === reqPath);

        const baseUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;
        const metaTags = buildMetaTags(seo, pageSeo, baseUrl, reqPath);

        const injected = html.replace('<!--SEO_INJECT-->', metaTags);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(200).send(injected);
    } catch (err: any) {
        console.error('SEO Middleware Error:', err);
        // DB error — serve plain HTML so app still works
        const plain = html.replace('<!--SEO_INJECT-->', `<title>எழுத்திடு</title>`);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(200).send(plain);
    }
}
