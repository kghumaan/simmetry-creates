#!/usr/bin/env python3
"""Local dev server with SPA fallback.

The site uses clean URLs (/jewelry, /woodwork/about, /admin) that Vercel
rewrites to index.html (see vercel.json). A plain `python3 -m http.server`
404s on those paths when reloading or deep-linking, so use this instead:

    python3 dev-server.py [port]     # default 8000
"""
import http.server
import os
import sys

os.chdir(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000


class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) and not self.path.startswith('/api/'):
            self.path = '/index.html'
        return super().send_head()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


print(f'Serving on http://127.0.0.1:{PORT} (SPA fallback -> index.html)')
http.server.ThreadingHTTPServer(('127.0.0.1', PORT), SPAHandler).serve_forever()
