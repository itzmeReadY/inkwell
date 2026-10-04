from pdf_compiler import compile_html_to_pdf

try:
    pdf = compile_html_to_pdf("<h1>Test</h1>", theme="clean")
    print(f"Generated PDF of size: {len(pdf)} bytes")
except Exception as e:
    print(f"Error: {e}")
