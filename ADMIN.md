# Studio admin

> Local development: run `python3 dev-server.py` (not `python3 -m http.server`) —
> the site's clean URLs need the SPA fallback to survive reloads and deep links.

Unlock editing at **`/admin`** (password: `1111`) — the site itself becomes the
admin. You land on the live pages exactly as visitors see them, and everything
becomes editable in place:

- **Click any text** to change it right where it is. Empty it to remove it —
  when every field in a section is empty, the whole section disappears
  (placeholders keep empty spots visible while editing).
- **Photographs**: reorder / remove / add pieces on the gallery; open a piece
  to edit its title, description, detail lines (metal, weight, shape, …),
  optional price, and extra angle photos; replace the About portrait.
- **Add** story paragraphs, process steps, and product detail lines with the
  small “+” buttons.
- Nothing changes for visitors until **Save & publish** in the bottom bar;
  Discard drops unsaved edits; “Reset to original…” restores the shipped
  content (after Save).

## How it works

- Site content lives as one JSON document. Defaults are baked into `js/data.jsx`;
  published overrides are stored in **Vercel Blob** (no database) and served by
  `api/content.js`. The site loads the published version at boot and falls back
  to the baked-in defaults.
- "Save & publish" in the admin panel writes to localStorage (instant preview on
  that browser) **and** to the API, which makes the change live for everyone.
- Uploaded photographs are downscaled in the browser (max 1600px) and stored in
  Blob via `api/upload.js`. If the API isn't configured yet, they are embedded
  inline in the content JSON as a fallback.

## One-time setup (≈2 minutes)

Publishing needs a Vercel Blob store connected to the project:

1. Vercel dashboard → the `simmetry-creates` project → **Storage** tab.
2. **Create Database → Blob** (any name), and connect it to the project.
   This injects `BLOB_READ_WRITE_TOKEN` automatically.
3. Redeploy (or just push a commit).

Until that's done, the admin panel still works but saves to the current browser
only, and it says so in the save bar.

## Contact form email

Inquiries submitted on the About page are emailed (with name, email, project
type, and message) to **simmetry.creates@gmail.com** by `api/inquiry.js`,
using [Resend](https://resend.com). One-time setup:

1. Create a free Resend account **with simmetry.creates@gmail.com**
   (free tier: 100 emails/day — plenty).
2. Resend dashboard → API Keys → Create → copy the key.
3. Vercel → project → Settings → Environment Variables →
   add `RESEND_API_KEY` = the key → redeploy.

Until a custom domain is verified in Resend, mail is sent from
`onboarding@resend.dev`, which only delivers to the Resend account owner's
address — that's exactly the studio Gmail, so it works out of the box.
Optional polish: verify `simmetrycreates.com` in Resend, then set
`INQUIRY_FROM` to e.g. `Simmetry.Creates <studio@simmetrycreates.com>`.
`INQUIRY_TO` overrides the recipient. Replying to an alert replies straight
to the person who wrote (their address is the reply-to).

If the key isn't set (or sending fails), the form tells the visitor to email
the studio directly — nothing is silently dropped.

## Changing the password

Set the `ADMIN_PASSWORD` environment variable in Vercel (falls back to `1111`)
and redeploy — that's it. The admin gate verifies the typed password against
the server, so the new password works immediately. The `ADMIN_PASSWORD`
constant in `js/admin.jsx` is only an offline fallback for local preview
(where no publishing is possible anyway).

Note: the password on a static site is a courtesy lock, not real security —
anyone reading the source can find it. Fine for keeping honest people out;
swap to real auth if that ever matters.
