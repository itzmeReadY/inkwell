## 2026-10-07 - HTTP Header Injection in PDF Export
**Vulnerability:** The `/api/compile-pdf` endpoint used the unvalidated user input `request.filename` directly in the `Content-Disposition` header.
**Learning:** Returning unvalidated input in HTTP headers can allow attackers to inject line breaks (`\r\n`) and arbitrary headers (HTTP Response Splitting). Furthermore, if the filename was read locally by standard tools, failing to restrict path traversals (`../`) can be problematic.
**Prevention:** Always sanitize input used in headers by removing newlines, quotes, and extracting only the base name (`os.path.basename`) before injecting it.
