import { createHmac } from 'node:crypto';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const port = Number(process.env.PORT || 4175);
const host = process.env.HOST || '0.0.0.0';
const credentialFile = join(root, '.xfyun.env');
const requestLog = new Map();

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.m4a': 'audio/mp4',
  '.mp3': 'audio/mpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav'
};

function credentials() {
  const values = { ...process.env };
  if (existsSync(credentialFile)) {
    for (const line of readFileSync(credentialFile, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match) values[match[1]] = match[2].trim();
    }
  }
  return {
    appId: values.XFYUN_APP_ID,
    apiKey: values.XFYUN_API_KEY,
    apiSecret: values.XFYUN_API_SECRET
  };
}

function json(response, status, body) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(body));
}

function rateLimited(address) {
  const now = Date.now();
  const recent = (requestLog.get(address) || []).filter(time => now - time < 60_000);
  recent.push(now);
  requestLog.set(address, recent);
  return recent.length > 30;
}

function signedIseUrl(apiKey, apiSecret) {
  const serviceHost = 'ise-api.xfyun.cn';
  const path = '/v2/open-ise';
  const date = new Date().toUTCString();
  const signatureSource = `host: ${serviceHost}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  const signature = createHmac('sha256', apiSecret).update(signatureSource).digest('base64');
  const authorizationSource = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const query = new URLSearchParams({
    authorization: Buffer.from(authorizationSource).toString('base64'),
    date,
    host: serviceHost
  });
  return `wss://${serviceHost}${path}?${query}`;
}

function serveFile(request, response) {
  const requestPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const relative = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  const file = normalize(join(root, relative));
  if (!file.startsWith(`${root}/`) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404).end('Not found');
    return;
  }
  response.writeHead(200, {
    'Content-Type': mimeTypes[extname(file).toLowerCase()] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff'
  });
  createReadStream(file).pipe(response);
}

createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname === '/api/xfyun-auth') {
    if (request.method !== 'GET') return json(response, 405, { error: 'Method not allowed' });
    if (rateLimited(request.socket.remoteAddress || 'unknown')) return json(response, 429, { error: '请求太频繁，请稍后再试。' });
    const config = credentials();
    if (!config.appId || !config.apiKey || !config.apiSecret) {
      return json(response, 503, { error: '讯飞语音评测尚未配置。' });
    }
    return json(response, 200, {
      appId: config.appId,
      url: signedIseUrl(config.apiKey, config.apiSecret)
    });
  }
  serveFile(request, response);
}).listen(port, host, () => {
  console.log(`English learning server: http://127.0.0.1:${port}/index.html`);
  console.log(existsSync(credentialFile) ? 'iFLYTEK ISE credentials: configured' : 'iFLYTEK ISE credentials: not configured');
});
