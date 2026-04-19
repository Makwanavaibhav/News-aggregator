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
    console.warn('Missing API Key, using proxy fallback directly');
    const proxyUrl = `https://saurav.tech/NewsAPI/top-headlines/category/${category}/${country}.json`;
    try {
      const proxyReq = await fetch(proxyUrl);
      const proxyData = await proxyReq.json();
      return res.status(200).json(proxyData);
    } catch(err) {
      return res.status(500).json({
        status: 'error',
        message: 'Server missing API key & proxy failed',
      });
    }
  }

  const url = new URL('https://newsapi.org/v2/top-headlines');
  url.searchParams.set('country', country);
  url.searchParams.set('category', category);
  url.searchParams.set('apiKey', apiKey);

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'NewsSphere/1.0 VercelServerless',
      }
    });
    const data = await r.json();

    if (data.status === 'error') {
      // NewsAPI free plan blocks Vercel. Fallback to public dummy NewsAPI proxy
      console.warn('NewsAPI error, falling back to proxy:', data.message);
      const proxyUrl = `https://saurav.tech/NewsAPI/top-headlines/category/${category}/${country}.json`;
      const proxyReq = await fetch(proxyUrl);
      const proxyData = await proxyReq.json();
      return res.status(200).json(proxyData);
    }
    
    res.status(200).json(data);
  } catch (e) {
    console.error(e);
    // If all fails, return 502 to trigger frontend mock data
    res.status(502).json({ status: 'error', message: 'Upstream fetch failed' });
  }
}
