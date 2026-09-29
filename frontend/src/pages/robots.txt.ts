import type { APIRoute } from 'astro';

/** /robots.txt — Allow everything except the API, sitemap linked. */
export const GET: APIRoute = ({ site }) => {
  const origin = site?.origin ?? '';
  return new Response(
    ['User-agent: *', 'Allow: /', 'Disallow: /api/', '', `Sitemap: ${origin}/sitemap-index.xml`, ''].join(
      '\n',
    ),
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      },
    },
  );
};