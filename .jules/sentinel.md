## 2024-10-24 - SSRF in Headless Chromium Playwright PDF Generation
**Vulnerability:** The Playwright browser rendering used to generate PDF from user-provided HTML did not restrict outgoing network requests, leading to Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI).
**Learning:** Even when Chromium is running headless to convert HTML to PDF, user-controlled HTML (e.g. `img` tags or CSS URLs) can cause the browser to make arbitrary network or local filesystem requests unless strictly intercepted and validated.
**Prevention:** Always restrict the network layer by adding a strict `page.route` network interceptor. Use `urllib.parse.urlparse` for URL validation instead of simple string matching, explicitly allowing safe protocols (like `data:`) and trusted hostnames (like `cdn.jsdelivr.net`), while aborting everything else.

## 2024-10-25 - Robust URL Validation for SSRF Prevention
**Vulnerability:** URL validation against an allowlist was using `urllib.parse.urlparse().netloc` instead of `hostname`.
**Learning:** `netloc` includes basic auth credentials and ports (e.g., `user:pass@host:port`). This can be exploited to bypass checks if insecure matching is used, or cause false negatives for valid URLs with ports.
**Prevention:** Always use `urllib.parse.urlparse().hostname` which correctly isolates the host domain, avoiding potential bypasses or false negatives.
