## 2024-10-24 - SSRF in Headless Chromium Playwright PDF Generation
**Vulnerability:** The Playwright browser rendering used to generate PDF from user-provided HTML did not restrict outgoing network requests, leading to Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI).
**Learning:** Even when Chromium is running headless to convert HTML to PDF, user-controlled HTML (e.g. `img` tags or CSS URLs) can cause the browser to make arbitrary network or local filesystem requests unless strictly intercepted and validated.
**Prevention:** Always restrict the network layer by adding a strict `page.route` network interceptor. Use `urllib.parse.urlparse` for URL validation instead of simple string matching, explicitly allowing safe protocols (like `data:`) and trusted hostnames (like `cdn.jsdelivr.net`), while aborting everything else.

## 2024-11-03 - CORS Misconfiguration with Allow Credentials
**Vulnerability:** The application was configured with `allow_origins=["*"]` and `allow_credentials=True` simultaneously, which is insecure and disallowed by Starlette, causing startup errors in production.
**Learning:** Wildcard origins should never be combined with allow_credentials. FastAPI requires explicit origins when allowing credentials to prevent credentialed cross-origin requests from arbitrary sites.
**Prevention:** Always use an environment variable (like `ALLOWED_ORIGINS`) to strictly define allowed origins in production environments when `allow_credentials` is true.
