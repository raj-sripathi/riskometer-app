import Redis from 'ioredis';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let redis;

  try {
    // Connect to Redis using REDIS_URL
    redis = new Redis(process.env.REDIS_URL);

    // Load rows from Redis
    const data = await redis.get('riskometer:rows');
    const rows = data ? JSON.parse(data) : [];

    return res.status(200).json({ success: true, rows });
  } catch (error) {
    console.error('Error loading rows:', error);
    return res.status(500).json({ error: 'Failed to load rows' });
  } finally {
    if (redis) {
      await redis.quit();
    }
  }
}
