const allowedOrigin = 'https://liuqiming168-work.github.io';

function responseHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff'
  };
}

function json(origin, status, body) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(origin) });
}

async function hmacBase64(secret, value) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
  return btoa(String.fromCharCode(...signature));
}

async function signedIseUrl(apiKey, apiSecret) {
  const serviceHost = 'ise-api.xfyun.cn';
  const path = '/v2/open-ise';
  const date = new Date().toUTCString();
  const source = `host: ${serviceHost}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  const signature = await hmacBase64(apiSecret, source);
  const authorization = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const query = new URLSearchParams({ authorization: btoa(authorization), date, host: serviceHost });
  return `wss://${serviceHost}${path}?${query}`;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (origin !== allowedOrigin) return json(allowedOrigin, 403, { error: 'Origin not allowed' });
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...responseHeaders(origin),
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    if (request.method !== 'GET') return json(origin, 405, { error: 'Method not allowed' });
    if (!env.XFYUN_APP_ID || !env.XFYUN_API_KEY || !env.XFYUN_API_SECRET) {
      return json(origin, 503, { error: 'iFLYTEK credentials are not configured' });
    }
    return json(origin, 200, {
      appId: env.XFYUN_APP_ID,
      url: await signedIseUrl(env.XFYUN_API_KEY, env.XFYUN_API_SECRET)
    });
  }
};
