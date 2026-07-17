# Studio admin

> Local development: run `python3 dev-server.py` (not `python3 -m http.server`) —
> the site's clean URLs need the SPA fallback to survive reloads and deep links.

Unlock editing at **`/admin`** (password: `1111`) — the site itself becomes the
admin. You land on the live pages exactly as visitors see them, and everything
becomes editable in place:

- **Click any text** to change it right where it is. Empty it to remove it —
  when every field in a section is empty, the whole section disappears
  (placeholders keep empty spots visible while editing).
- **Photographs**: reorder / remove / add pieces on any listing; open a piece
  to edit its title, description, detail lines (metal, weight, shape, …),
  optional price, bucket, and extra angle photos; replace the About portrait.
- **Add** story paragraphs, process steps, and product detail lines with the
  small “+” buttons.
- Nothing changes for visitors until **Save & publish** in the bottom bar;
  Discard drops unsaved edits; “Reset to original…” restores the shipped
  content (after Save).

## The home page

Each mode (jewelry, woodwork) has its own home page at `/jewelry` and
`/woodwork`, in three parts — all editable in place:

1. **Hero** — a full-bleed photograph about three quarters of the screen tall,
   with an eyebrow, headline, one or two sentences, and a button.
   “Replace hero photograph” sits at its bottom-right while editing.
2. **Six buckets** — the collections, edge to edge. Clicking one opens its
   pieces at `/jewelry/c/necklaces`.
3. **The film** — a full-height band at the bottom.

### Bulk upload into a bucket

Under each bucket tile while editing:

- **Tile photo** — the single photograph shown on the bucket tile itself.
- **+ Bulk upload to \<bucket\>** — pick as many photographs as you like in one
  go. Every one becomes a piece already filed under that bucket, and the first
  fills the tile if it is still empty. Open a piece afterwards to give it a
  title, details, and a price. This is the fastest way to fill a new collection.

The small bar under each tile reorders buckets (← →), opens one (✎), or removes
it (×). Removing a bucket leaves its pieces alone — they simply stop appearing
under a collection until they are filed again on their product pages.

### The film

The band shows its **poster image** until a film is supplied. To add one, upload
the video somewhere it can be served (the Blob store, or any host), then paste
its address into **Film address (mp4)** in the edit box at the band's
bottom-right. It then plays muted and looping. Clear the address to fall back to
the poster.

## Buckets and pieces

Every piece carries a `category` — the key of the bucket it belongs to. Pieces
whose bucket is empty or unrecognised still work: they appear under **All work**
and open normally, they just sit outside the six collections. File one by opening
it and choosing from the **Bucket** dropdown.

Renaming a bucket's label is safe at any time. The `key` behind it is what pieces
point at, so it is not editable from the site — changing keys means editing
`js/data.jsx`.

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
