import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        async def restrict_network(route):
            url = route.request.url
            if url.startswith("data:"):
                await route.continue_()
            elif url.startswith("https://cdn.jsdelivr.net/") or url.startswith("https://fonts.googleapis.com/") or url.startswith("https://fonts.gstatic.com/"):
                await route.continue_()
            else:
                print(f"Blocked: {url}")
                await route.abort()

        await page.route("**/*", restrict_network)

        html_content = """
        <html>
        <head><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"></head>
        <body>
        <h1>Hello</h1>
        <img src="file:///etc/passwd">
        <img src="http://example.com/test.png">
        </body>
        </html>
        """
        await page.set_content(html_content, wait_until="networkidle")
        pdf = await page.pdf()
        print(f"PDF generated: {len(pdf)} bytes")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
