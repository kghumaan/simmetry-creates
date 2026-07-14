// Site content API — backed by Vercel Blob (no database).
// GET  /api/content -> the published content JSON (404 until first publish)
// POST /api/content { password, content } -> publish new content
//
// Requires a Vercel Blob store connected to the project (BLOB_READ_WRITE_TOKEN
// is injected automatically). See ADMIN.md.

const CONTENT_KEY = 'content/site-content.json';

async function loadBlobSdk() {
  try { return await import('@vercel/blob'); }
  catch { return null; }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const blob = await loadBlobSdk();
  const configured = Boolean(process.env.BLOB_READ_WRITE_TOKEN) && blob;

  if (req.method === 'GET') {
    if (!configured) return res.status(404).json({ error: 'blob-not-configured' });
    try {
      const { blobs } = await blob.list({ prefix: CONTENT_KEY, limit: 5 });
      const hit = blobs.find(b => b.pathname === CONTENT_KEY);
      if (!hit) return res.status(404).json({ error: 'no-content-published' });
      const r = await fetch(`${hit.url}?ts=${Date.now()}`, { cache: 'no-store' });
      if (!r.ok) return res.status(502).json({ error: 'blob-fetch-failed' });
      return res.status(200).json(await r.json());
    } catch (e) {
      return res.status(500).json({ error: 'content-read-failed' });
    }
  }

  if (req.method === 'POST') {
    const { password, content, verifyOnly } = req.body || {};
    if (password !== (process.env.ADMIN_PASSWORD || '1111')) {
      return res.status(401).json({ error: 'bad-password' });
    }
    // Password check for the admin gate — works even before Blob is set up.
    if (verifyOnly) return res.status(200).json({ ok: true, verified: true });
    if (!configured) return res.status(503).json({ error: 'blob-not-configured' });
    if (!content || typeof content !== 'object') {
      return res.status(400).json({ error: 'bad-content' });
    }
    try {
      await blob.put(CONTENT_KEY, JSON.stringify(content), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        cacheControlMaxAge: 60,
      });
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'content-write-failed' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'method-not-allowed' });
};
