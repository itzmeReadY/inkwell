## 2024-10-24 - SSRF in Headless Chromium Playwright PDF Generation
**Vulnerability:** The Playwright browser rendering used to generate PDF from user-provided HTML did not restrict outgoing network requests, leading to Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI).
**Learning:** Even when Chromium is running headless to convert HTML to PDF, user-controlled HTML (e.g. `img` tags or CSS URLs) can cause the browser to make arbitrary network or local filesystem requests unless strictly intercepted and validated.
**Prevention:** Always restrict the network layer by adding a strict `page.route` network interceptor. Use `urllib.parse.urlparse` for URL validation instead of simple string matching, explicitly allowing safe protocols (like `data:`) and trusted hostnames (like `cdn.jsdelivr.net`), while aborting everything else.

## 2024-10-24 - SSRF vulnerability due to insecure netloc matching
**Vulnerability:** The SSRF prevention filter in Playwright network interception used urllib.parse.urlparse(url).netloc for allowlisting. An attacker could potentially bypass this if substring matching or other insecure methods are used on `netloc`, since `netloc` includes basic auth credentials and ports (user:pass@host:port).
**Learning:** `netloc` contains more than just the hostname. Relying on it for domain validation is dangerous. For instance, an exact match might not be vulnerable to `http://cdn.jsdelivr.net@evil.com` but a `in` or `startswith` check would be.
**Prevention:** Always use robust URL parsing and strictly verify the `hostname` property rather than `netloc` when validating URLs against an allowlist.
