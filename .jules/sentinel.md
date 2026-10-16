## 2024-05-14 - SSRF and Local File Inclusion in Headless Browsers
**Vulnerability:** Headless browsers (like Playwright/Puppeteer) rendering user-controlled HTML to PDF can fetch arbitrary internal URLs or local files (e.g. `file:///etc/passwd`) if the network layer is not restricted.
**Learning:** The browser instance used to convert HTML to PDF runs with the backend server's network access. Unrestricted `page.set_content` allows malicious HTML to exploit this via tags like `<img>`, `<script>`, or `<link>`.
**Prevention:** Always restrict the browser's network layer using an interceptor (e.g., `page.route` in Playwright) with an explicit allowlist of safe domains and protocols (e.g., `data:`) before setting content or navigating.
