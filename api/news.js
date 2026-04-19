/**
 * Vercel serverless: proxies NewsAPI so the key stays off the client in production.
 * Set VITE_NEWS_API_KEY (or NEWS_API_KEY) in the project env on Vercel.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ status: 'error', message: 'Method not allowed' });
    return;
  }

  const category = req.query?.category || 'general';
  const country = process.env.VITE_NEWS_COUNTRY || 'us';
  const apiKey = process.env.VITE_NEWS_API_KEY || process.env.NEWS_API_KEY;

  if (!apiKey) {
    res.status(500).json({
      status: 'error',
      message: 'Server is missing VITE_NEWS_API_KEY or NEWS_API_KEY',
    });
    return;
  }

  const url = new URL('https://newsapi.org/v2/top-headlines');
  url.searchParams.set('country', country);
  url.searchParams.set('category', category);
  url.searchParams.set('apiKey', apiKey);

  try {
    const r = await fetch(url);
    const data = await r.json();
    res.status(200).json(data);
  } catch (e) {
    console.error(e);
    res.status(502).json({ status: 'error', message: 'Upstream fetch failed' });
  }
}
