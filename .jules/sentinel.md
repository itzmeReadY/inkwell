## 2026-10-19 - SSRF Prevention in Playwright HTML to PDF
**Vulnerability:** Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI) in the PDF compiler.
**Learning:** When headless browsers render user-provided HTML, they can fetch arbitrary local files or make internal network requests unless strictly configured.
**Prevention:** Explicitly restrict Playwright browser network layers via `page.route` allowlists using robust `urlparse` checks (allowing only specific schemes like `data:` and specific CDN `netloc`s).
