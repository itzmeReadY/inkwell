import asyncio
from pdf_compiler import compile_html_to_pdf

async def main():
    try:
        pdf = await compile_html_to_pdf("<h1>Test</h1>", theme="clean")
        print(f"Generated PDF of size: {len(pdf)} bytes")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    asyncio.run(main())
