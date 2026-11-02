## 2024-10-24 - SSRF in Headless Chromium Playwright PDF Generation
**Vulnerability:** The Playwright browser rendering used to generate PDF from user-provided HTML did not restrict outgoing network requests, leading to Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI).
**Learning:** Even when Chromium is running headless to convert HTML to PDF, user-controlled HTML (e.g. `img` tags or CSS URLs) can cause the browser to make arbitrary network or local filesystem requests unless strictly intercepted and validated.
**Prevention:** Always restrict the network layer by adding a strict `page.route` network interceptor. Use `urllib.parse.urlparse` for URL validation instead of simple string matching, explicitly allowing safe protocols (like `data:`) and trusted hostnames (like `cdn.jsdelivr.net`), while aborting everything else.

## 2024-11-02 - Overly Permissive CORS Configuration with Credentials
**Vulnerability:** Combining allow_origins=['*'] with allow_credentials=True in FastAPI/Starlette CORS configuration.
**Learning:** This combination allows arbitrary domains to send authenticated cross-origin requests, leading to potential Cross-Site Request Forgery (CSRF) or data leakage. It also causes errors when the server starts up.
**Prevention:** Use an environment-based approach to read allowed origins securely instead of wildcarding, and ensure proper origin verification for CORS configurations.
