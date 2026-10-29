## 2024-10-24 - SSRF in Headless Chromium Playwright PDF Generation
**Vulnerability:** The Playwright browser rendering used to generate PDF from user-provided HTML did not restrict outgoing network requests, leading to Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI).
**Learning:** Even when Chromium is running headless to convert HTML to PDF, user-controlled HTML (e.g. `img` tags or CSS URLs) can cause the browser to make arbitrary network or local filesystem requests unless strictly intercepted and validated.
**Prevention:** Always restrict the network layer by adding a strict `page.route` network interceptor. Use `urllib.parse.urlparse` for URL validation instead of simple string matching, explicitly allowing safe protocols (like `data:`) and trusted hostnames (like `cdn.jsdelivr.net`), while aborting everything else.

## 2024-10-29 - Insecure URL Validation using netloc
**Vulnerability:** The application used `urllib.parse.urlparse(url).netloc` for checking the domain against an allowlist for SSRF prevention.
**Learning:** `netloc` includes credentials and ports (e.g., `user:pass@domain:port`). Using `netloc` with strict string matching or `in` operator can lead to bypasses or false negatives, whereas `hostname` cleanly provides just the domain part.
**Prevention:** Always use `parsed.hostname` instead of `parsed.netloc` when validating URLs against an allowlist to ensure accurate domain verification and prevent bypasses.
