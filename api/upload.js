// Image upload API — stores admin-uploaded photographs in Vercel Blob.
// POST /api/upload { password, name, dataUrl } -> { url }
// The client keeps images at the best quality that fits Vercel's ~4.5 MB
// request-body limit (see smyShrinkImage in js/content.jsx): small files
// pass through untouched, larger ones re-encode at up to 2560px.

const MAX_BYTES = 8 * 1024 * 1024;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method-not-allowed' });
  }

  const { password, name, dataUrl } = req.body || {};
  if (password !== (process.env.ADMIN_PASSWORD || '1111')) {
    return res.status(401).json({ error: 'bad-password' });
  }

  let blob;
  try { blob = await import('@vercel/blob'); } catch { blob = null; }
  if (!process.env.BLOB_READ_WRITE_TOKEN || !blob) {
    return res.status(503).json({ error: 'blob-not-configured' });
  }

  const match = /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i.exec(dataUrl || '');
  if (!match) return res.status(400).json({ error: 'bad-data-url' });

  const contentType = match[1].toLowerCase();
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > MAX_BYTES) return res.status(413).json({ error: 'too-large' });

  const base = String(name || 'photo')
    .replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'photo';
  const ext = contentType.split('/')[1].replace('jpeg', 'jpg');

  try {
    const stored = await blob.put(`images/${Date.now()}-${base}.${ext}`, buffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType,
      cacheControlMaxAge: 31536000,
    });
    return res.status(200).json({ url: stored.url });
  } catch (e) {
    return res.status(500).json({ error: 'upload-failed' });
  }
};
