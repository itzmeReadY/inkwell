## 2026-10-18 - Prevent SSRF and LFI in Headless Chrome
**Vulnerability:** Playwright was rendering user-controlled HTML to PDF without network restrictions, allowing Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI).
**Learning:** Headless browsers evaluating user HTML can be tricked into fetching internal metadata services, local files, or internal network endpoints.
**Prevention:** Always restrict network requests using strict route interception (allowlists) with robust URL parsing to verify schemes and hostnames.
