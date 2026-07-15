// Contact-form email — POST /api/inquiry { name, email, project, message }
// Sends an alert with every detail to the studio inbox via Resend's REST API
// (no SDK dependency). Requires RESEND_API_KEY in the environment; recipient
// and sender are overridable via INQUIRY_TO / INQUIRY_FROM. See ADMIN.md.

const RESEND_URL = 'https://api.resend.com/emails';

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method-not-allowed' });
  }

  const clean = (v, max) => String(v || '').trim().slice(0, max);
  const { name, email, project, message } = req.body || {};
  const cName = clean(name, 200);
  const cEmail = clean(email, 200);
  const cProject = clean(project, 40) || 'unspecified';
  const cMessage = clean(message, 5000);

  if (!cName || !cEmail || !cMessage) return res.status(400).json({ error: 'missing-fields' });
  if (!/^\S+@\S+\.\S+$/.test(cEmail)) return res.status(400).json({ error: 'bad-email' });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ error: 'email-not-configured' });

  const to = process.env.INQUIRY_TO || 'simmetry.creates@gmail.com';
  const from = process.env.INQUIRY_FROM || 'Simmetry.Creates <onboarding@resend.dev>';

  const text = [
    'New commission inquiry from the website.',
    '',
    `Name:          ${cName}`,
    `Email:         ${cEmail}`,
    `Project type:  ${cProject}`,
    `Received:      ${new Date().toISOString()}`,
    '',
    'Message:',
    cMessage,
    '',
    '— Reply directly to this email to answer them.',
  ].join('\n');

  try {
    const r = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: cEmail,
        subject: `New inquiry — ${cName} (${cProject})`,
        text,
      }),
    });
    if (!r.ok) return res.status(502).json({ error: 'send-failed' });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ error: 'send-failed' });
  }
};
