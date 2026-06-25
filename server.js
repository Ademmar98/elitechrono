import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, 'dist');
const port = process.env.PORT || 3000;
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const FB_PIXEL_ID = process.env.FB_PIXEL_ID;

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp',
};

http.createServer((req, res) => {
  // CORS for dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // CAPI track endpoint
  if (req.method === 'POST' && req.url === '/api/track') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const events = JSON.parse(body);
        if (!FB_ACCESS_TOKEN || !FB_PIXEL_ID) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'CAPI not configured' }));
          return;
        }
        const fbRes = await fetch(`https://graph.facebook.com/v22.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(events),
        });
        const fbData = await fbRes.json();
        res.writeHead(fbRes.ok ? 200 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(fbData));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // WeChat Catalog product fetch proxy
  if (req.method === 'POST' && req.url === '/api/wechat/fetch-product') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { url, cookie } = JSON.parse(body);
        const parsedUrl = new URL(url);
        const segments = parsedUrl.pathname.split('/').filter(Boolean);

        if (segments.length < 4 || segments[0] !== 'weshop' || segments[1] !== 'goods') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid WeChat Catalog URL format' }));
          return;
        }

        const shopId = segments[2];
        const goodsId = segments[3];

        if (shopId.length < 5 || goodsId.length < 5) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid shop ID or goods ID in URL' }));
          return;
        }

        const apiUrl = `https://${parsedUrl.hostname}/commodity/view?targetAlbumId=${encodeURIComponent(shopId)}&itemId=${encodeURIComponent(goodsId)}&t=${Date.now()}`;

        const response = await fetch(apiUrl, {
          headers: {
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Referer': url,
          },
        });

        const data = await response.json();

        if (data.errcode !== 0) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: data.errmsg || 'Failed to fetch product' }));
          return;
        }

        const commodity = data.result?.commodity || data.result || {};
        const images = commodity.imgsSrc || commodity.imgs || [];

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          title: commodity.title || '',
          subTitle: commodity.subTitle || '',
          price: commodity.price || commodity.optimaPrice || '',
          images: images,
          videoThumb: commodity.videoThumbImg || null,
        }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Static files
  let file = req.url === '/' ? '/index.html' : req.url;
  if (!path.extname(file)) file = '/index.html';
  const fpath = path.join(dist, file);
  if (!fpath.startsWith(dist)) { res.writeHead(403); res.end(); return; }
  fs.readFile(fpath, (err, data) => {
    if (err) {
      fs.readFile(path.join(dist, 'index.html'), (e2, d2) => {
        if (e2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(d2);
      });
      return;
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(port, () => console.log(`Server on ${port}`));
