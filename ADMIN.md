# Studio admin

The site has an admin panel at **`/#/admin`** (password: `1111`). It edits every
photograph (jewelry gallery, woodwork gallery, About portrait) and every piece of
text on the Gallery pages, the About page, and the footer.

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

## Changing the password

Set the `ADMIN_PASSWORD` environment variable in Vercel (falls back to `1111`)
and redeploy — that's it. The admin gate verifies the typed password against
the server, so the new password works immediately. The `ADMIN_PASSWORD`
constant in `js/admin.jsx` is only an offline fallback for local preview
(where no publishing is possible anyway).

Note: the password on a static site is a courtesy lock, not real security —
anyone reading the source can find it. Fine for keeping honest people out;
swap to real auth if that ever matters.
