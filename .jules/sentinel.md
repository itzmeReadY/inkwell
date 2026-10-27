## 2024-10-24 - SSRF in Headless Chromium Playwright PDF Generation
**Vulnerability:** The Playwright browser rendering used to generate PDF from user-provided HTML did not restrict outgoing network requests, leading to Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI).
**Learning:** Even when Chromium is running headless to convert HTML to PDF, user-controlled HTML (e.g. `img` tags or CSS URLs) can cause the browser to make arbitrary network or local filesystem requests unless strictly intercepted and validated.
**Prevention:** Always restrict the network layer by adding a strict `page.route` network interceptor. Use `urllib.parse.urlparse` for URL validation instead of simple string matching, explicitly allowing safe protocols (like `data:`) and trusted hostnames (like `cdn.jsdelivr.net`), while aborting everything else.
## 2025-02-14 - SSRF vulnerability due to insecure URL parsing in allowlist
**Vulnerability:** The route interceptor in Playwright used `urllib.parse.urlparse(url).netloc` to validate if a request was targeting an allowed domain.
**Learning:** `netloc` includes basic authentication credentials and ports (e.g. `user:pass@example.com:80`), which can cause false negatives by blocking valid requests containing ports, or be exploited to bypass checks if insecure substring matching (`in` or `startswith`) is used.
**Prevention:** Always use `parsed.hostname` rather than `parsed.netloc` when strictly verifying hostnames in SSRF prevention allowlists.
