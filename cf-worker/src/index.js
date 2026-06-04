const YAHOO_BASE = 'https://query1.finance.yahoo.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Only allow Yahoo Finance paths we actually use
    const allowed = url.pathname.startsWith('/v8/finance/chart/') ||
                    url.pathname.startsWith('/v1/finance/search');
    if (!allowed) return new Response('Not found', { status: 404 });

    const target = `${YAHOO_BASE}${url.pathname}${url.search}`;

    let response;
    try {
      response = await fetch(target, {
        headers: {
          'User-Agent': UA,
          'Accept': 'application/json, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://finance.yahoo.com/',
        },
        cf: { cacheTtl: 3600, cacheEverything: true },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await response.arrayBuffer();
    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  },
};
