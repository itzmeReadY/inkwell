## 2024-10-24 - SSRF in Headless Chromium Playwright PDF Generation
**Vulnerability:** The Playwright browser rendering used to generate PDF from user-provided HTML did not restrict outgoing network requests, leading to Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI).
**Learning:** Even when Chromium is running headless to convert HTML to PDF, user-controlled HTML (e.g. `img` tags or CSS URLs) can cause the browser to make arbitrary network or local filesystem requests unless strictly intercepted and validated.
**Prevention:** Always restrict the network layer by adding a strict `page.route` network interceptor. Use `urllib.parse.urlparse` for URL validation instead of simple string matching, explicitly allowing safe protocols (like `data:`) and trusted hostnames (like `cdn.jsdelivr.net`), while aborting everything else.
## 2024-05-15 - Robust URL Validation for SSRF Protection
**Vulnerability:** URL validation for SSRF prevention relied on checking `urllib.parse.urlparse(url).netloc` against an allowlist.
**Learning:** Using `netloc` is flawed because it includes authentication credentials and port numbers (e.g., `user:pass@host:port`). This can lead to false negatives (valid requests with ports are blocked) or potential bypasses if substring matching is used insecurely.
**Prevention:** Always use `parsed.hostname` instead of `parsed.netloc` when verifying domain names against an allowlist.
