## 2024-10-24 - SSRF in Headless Chromium Playwright PDF Generation
**Vulnerability:** The Playwright browser rendering used to generate PDF from user-provided HTML did not restrict outgoing network requests, leading to Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI).
**Learning:** Even when Chromium is running headless to convert HTML to PDF, user-controlled HTML (e.g. `img` tags or CSS URLs) can cause the browser to make arbitrary network or local filesystem requests unless strictly intercepted and validated.
**Prevention:** Always restrict the network layer by adding a strict `page.route` network interceptor. Use `urllib.parse.urlparse` for URL validation instead of simple string matching, explicitly allowing safe protocols (like `data:`) and trusted hostnames (like `cdn.jsdelivr.net`), while aborting everything else.

## 2024-11-04 - Insecure CORS and SSRF Validation Bypass
**Vulnerability:** CORS was overly permissive (`allow_origins=["*"]` combined with `allow_credentials=True`), and SSRF protections used `parsed.netloc` instead of `parsed.hostname`.
**Learning:** Using `allow_origins=["*"]` with `allow_credentials=True` is fundamentally insecure and fails in modern FastAPI/Starlette. Additionally, `urllib.parse.urlparse().netloc` includes basic auth credentials and ports, which can bypass simple allowlist checks.
**Prevention:** Always use an environment variable (e.g., `ALLOWED_ORIGINS`) for CORS instead of wildcards when credentials are allowed. For SSRF protections, always validate against `parsed.hostname` rather than `netloc`.
