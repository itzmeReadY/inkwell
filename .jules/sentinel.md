## 2024-10-24 - SSRF in Headless Chromium Playwright PDF Generation
**Vulnerability:** The Playwright browser rendering used to generate PDF from user-provided HTML did not restrict outgoing network requests, leading to Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI).
**Learning:** Even when Chromium is running headless to convert HTML to PDF, user-controlled HTML (e.g. `img` tags or CSS URLs) can cause the browser to make arbitrary network or local filesystem requests unless strictly intercepted and validated.
**Prevention:** Always restrict the network layer by adding a strict `page.route` network interceptor. Use `urllib.parse.urlparse` for URL validation instead of simple string matching, explicitly allowing safe protocols (like `data:`) and trusted hostnames (like `cdn.jsdelivr.net`), while aborting everything else.

## 2024-10-28 - URL Validation using netloc instead of hostname
**Vulnerability:** The SSRF prevention logic in Playwright PDF generation used `urllib.parse.urlparse(url).netloc` for domain allowlisting instead of `.hostname`.
**Learning:** `netloc` includes basic authentication credentials and ports. This can cause false negatives or be exploited to bypass checks if insecure substring matching is used.
**Prevention:** Always strictly verify `hostname` rather than `netloc` when validating URLs against an allowlist in `urllib.parse`.
