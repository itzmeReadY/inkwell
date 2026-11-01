## 2024-10-24 - SSRF in Headless Chromium Playwright PDF Generation
**Vulnerability:** The Playwright browser rendering used to generate PDF from user-provided HTML did not restrict outgoing network requests, leading to Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI).
**Learning:** Even when Chromium is running headless to convert HTML to PDF, user-controlled HTML (e.g. `img` tags or CSS URLs) can cause the browser to make arbitrary network or local filesystem requests unless strictly intercepted and validated.
**Prevention:** Always restrict the network layer by adding a strict `page.route` network interceptor. Use `urllib.parse.urlparse` for URL validation instead of simple string matching, explicitly allowing safe protocols (like `data:`) and trusted hostnames (like `cdn.jsdelivr.net`), while aborting everything else.

## 2024-11-01 - Permissive CORS in FastAPI
**Vulnerability:** The FastAPI application used `allow_origins=["*"]` along with `allow_credentials=True`. This is insecure and actually raises errors in modern Starlette versions on startup.
**Learning:** Combining a wildcard allowed origin with allowed credentials defeats the purpose of CORS and can lead to CSRF-like data exposure. Starlette correctly enforces this invalid combination now.
**Prevention:** Always restrict CORS to specific trusted frontend domains rather than using `*` when credentials (like cookies or auth headers) are expected.
