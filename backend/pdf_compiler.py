"""
PDF Compiler using Playwright — High-fidelity headless Chromium rendering.
Avoids system Chrome dependency issues by using Playwright's bundled browser.
Works seamlessly across Windows, Mac, Linux, and Render.
"""
import tempfile
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

# ─── Theme CSS (maps to frontend themes) ───────────────────────────────────────


THEME_STYLES = {
    "grid": """
        html, body {
            background-color: #fafbfc !important;
            background-image:
                linear-gradient(to right, rgba(99, 102, 241, 0.10) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(99, 102, 241, 0.10) 1px, transparent 1px) !important;
            background-size: 22px 22px !important;
            color: #1e293b !important;
        }
        h1, h2, h3, h4 {
            color: #0f172a !important;
            padding-bottom: 4px;
        }
        .katex-display, .math-block {
            background: rgba(241, 245, 249, 0.85) !important;
            border: 1px solid rgba(99, 102, 241, 0.2) !important;
            border-radius: 8px !important;
            padding: 12px 18px !important;
        }
        blockquote {
            border-left: 4px solid #6366f1 !important;
            background: rgba(99, 102, 241, 0.05) !important;
            color: #334155 !important;
        }
    """,
    "dark": """
        html, body {
            background-color: #0b0f19 !important;
            background-image:
                linear-gradient(to right, rgba(56, 189, 248, 0.09) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(56, 189, 248, 0.09) 1px, transparent 1px) !important;
            background-size: 22px 22px !important;
            color: #f1f5f9 !important;
        }
        h1, h2, h3, h4 {
            color: #38bdf8 !important;
            padding-bottom: 4px;
        }
        .katex {
            color: #f8fafc !important;
        }
        .katex-display, .math-block {
            background: rgba(30, 41, 59, 0.85) !important;
            border: 1px solid rgba(56, 189, 248, 0.25) !important;
            border-radius: 8px !important;
            padding: 12px 18px !important;
        }
        blockquote {
            border-left: 4px solid #38bdf8 !important;
            background: rgba(56, 189, 248, 0.08) !important;
            color: #cbd5e1 !important;
        }
    """,
    "dark-clean": """
        html, body {
            background-color: #0f141c !important;
            background-image: none !important;
            color: #f1f5f9 !important;
        }
        h1, h2, h3, h4 {
            color: #60a5fa !important;
            padding-bottom: 4px;
        }
        .katex {
            color: #f8fafc !important;
        }
        .katex-display, .math-block {
            background: #192231 !important;
            border: 1px solid rgba(96, 165, 250, 0.2) !important;
            border-radius: 8px !important;
            padding: 12px 18px !important;
        }
        blockquote {
            border-left: 4px solid #60a5fa !important;
            background: rgba(96, 165, 250, 0.08) !important;
            color: #cbd5e1 !important;
        }
    """,
    "dotgrid": """
        html, body {
            background-color: #ffffff !important;
            background-image: radial-gradient(circle, rgba(71, 85, 105, 0.22) 1.2px, transparent 1.2px) !important;
            background-size: 20px 20px !important;
            color: #1e293b !important;
        }
        h1, h2, h3, h4 {
            color: #0f172a !important;
            padding-bottom: 4px;
        }
        .katex-display, .math-block {
            background: rgba(248, 250, 252, 0.85) !important;
            border: 1px solid rgba(0, 0, 0, 0.1) !important;
            border-radius: 8px !important;
            padding: 12px 18px !important;
        }
        blockquote {
            border-left: 4px solid #0284c7 !important;
            background: rgba(2, 132, 199, 0.05) !important;
            color: #334155 !important;
        }
    """,
    "clean": """
        html, body {
            background-color: #ffffff !important;
            background-image: none !important;
            color: #0f172a !important;
        }
        h1, h2, h3, h4 {
            color: #0f172a !important;
            padding-bottom: 4px;
        }
        .katex-display, .math-block {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 8px !important;
            padding: 12px 18px !important;
        }
        blockquote {
            border-left: 4px solid #64748b !important;
            background: #f8fafc !important;
            color: #334155 !important;
        }
    """
}

# ─── Font Definitions ───────────────────────────────────────────────────────────

FONT_FAMILIES = {
    "architect": (
        "'Architects Daughter', cursive",
        "@import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap');",
        "20px",
        "1.65"
    ),
    "kalam": (
        "'Kalam', cursive",
        "@import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap');",
        "21px",
        "1.7"
    ),
    "caveat": (
        "'Caveat', cursive",
        "@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');",
        "24px",
        "1.55"
    ),
    "shadows": (
        "'Shadows Into Light', cursive",
        "@import url('https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap');",
        "22px",
        "1.7"
    ),
    "reenie": (
        "'Reenie Beanie', cursive",
        "@import url('https://fonts.googleapis.com/css2?family=Reenie+Beanie&display=swap');",
        "25px",
        "1.85"
    ),
    "gochi": (
        "'Gochi Hand', cursive",
        "@import url('https://fonts.googleapis.com/css2?family=Gochi+Hand&display=swap');",
        "22px",
        "1.7"
    ),
}

# ─── Layout CSS ─────────────────────────────────────────────────────────────────

LAYOUT_STYLES = {
    "single": "",
    "two-column": """
        .note-container {
            column-count: 2;
            column-gap: 36px;
            column-rule: 1px dashed rgba(125, 125, 125, 0.28);
        }
        .note-container h1 {
            column-span: all;
            padding-bottom: 8px;
            margin-bottom: 18px;
        }
        .note-container h2,
        .note-container h3,
        .note-container blockquote,
        .note-container .katex-display,
        .note-container .math-block,
        .note-container pre {
            break-inside: avoid;
            page-break-inside: avoid;
        }
    """,
    "cornell": """
        .note-container {
            border-left: 3px solid #ef4444;
            padding-left: 28px !important;
            margin-left: 14px;
        }
    """
}


def _build_drawing_overlay_html(drawings: list | None, is_dark: bool) -> str:
    """Build HTML for drawing overlay images (base64 PNG data URLs)."""
    if not drawings:
        return ""
    
    blend_mode = "screen" if is_dark else "multiply"
    
    parts = []
    for drawing in drawings:
        if not drawing:
            continue
        parts.append(
            f'<img src="{drawing}" class="drawing-overlay" style="mix-blend-mode: {blend_mode};" />'
        )
    return "\\n".join(parts)


def _build_textbox_html(textboxes: list | None) -> str:
    """Build HTML for freeform text box annotations."""
    if not textboxes:
        return ""
    
    parts = []
    for box in textboxes:
        if not box or not box.get("text"):
            continue
        x = box.get("x", 0)
        y = box.get("y", 0)
        color = box.get("color", "#1e293b")
        font_size = box.get("fontSize", 20)
        text = box.get("text", "")
        parts.append(
            f'<div class="text-annotation" style="'
            f'left:{x}px;top:{y}px;color:{color};font-size:{font_size}px;'
            f'">{text}</div>'
        )
    return "\\n".join(parts)


async def compile_html_to_pdf(
    inner_html: str,
    theme: str = "grid",
    font: str = "architect",
    layout: str = "single",
    drawings: list | None = None,
    textboxes: list | None = None,
) -> bytes:
    """
    Compile HTML content into a high-quality PDF using Playwright.
    Avoids unreliable local Chrome detection by using Playwright's bundled browser.
    """
    font_family, font_url, font_size, line_height = FONT_FAMILIES.get(
        font, FONT_FAMILIES["architect"]
    )
    theme_css = THEME_STYLES.get(theme, THEME_STYLES["grid"])
    layout_css = LAYOUT_STYLES.get(layout, "")
    is_dark = theme.startswith("dark")
    
    drawing_html = _build_drawing_overlay_html(drawings, is_dark)
    textbox_html = _build_textbox_html(textboxes)

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Inkwell Notes</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
  <style>
    {font_url}
    @page {{
      size: A4;
      margin: 0 !important;
    }}
    * {{
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }}
    html, body {{
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
    }}
    body {{
      font-family: {font_family} !important;
      font-size: {font_size};
      line-height: {line_height};
      letter-spacing: 0.35px;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }}
    .page-wrapper {{
      position: relative;
      width: 100%;
      min-height: 100vh;
      overflow: hidden;
      page-break-after: always;
    }}
    .note-container {{
      padding: 36px 40px;
      width: 100%;
      min-height: 100%;
      box-sizing: border-box;
      position: relative;
      z-index: 1;
    }}
    h1 {{
      font-size: 34px;
      margin-top: 8px;
      margin-bottom: 14px;
      transform: rotate(-0.35deg);
      transform-origin: left center;
    }}
    h2 {{
      font-size: 28px;
      margin-top: 24px;
      margin-bottom: 10px;
      transform: rotate(-0.25deg);
      transform-origin: left center;
    }}
    h3 {{
      font-size: 24px;
      margin-top: 18px;
      margin-bottom: 8px;
    }}
    p {{
      margin: 12px 0;
    }}
    ul, ol {{
      padding-left: 28px;
      margin: 12px 0;
    }}
    li {{
      margin: 6px 0;
    }}
    blockquote {{
      margin: 16px 0;
      padding: 10px 18px;
      border-radius: 6px;
      transform: rotate(0.15deg);
    }}
    code {{
      font-family: 'Fira Code', 'Courier New', monospace;
      font-size: 0.85em;
      background: rgba(125, 125, 125, 0.16);
      padding: 2px 6px;
      border-radius: 4px;
    }}
    pre code {{
      display: block;
      padding: 14px;
      overflow-x: auto;
      border-radius: 6px;
    }}
    .katex-display, .math-block {{
      margin: 16px 0 !important;
      overflow-x: auto;
      overflow-y: hidden;
    }}
    .katex {{
      font-size: 1.15em;
    }}
    
    /* Drawing overlay */
    .drawing-overlay {{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
      pointer-events: none;
    }}
    
    /* Text annotations */
    .text-annotation {{
      position: absolute;
      z-index: 5;
      white-space: pre-wrap;
      word-break: break-word;
      font-family: inherit;
    }}
    
    /* Theme overrides */
    {theme_css}
    
    /* Layout overrides */
    {layout_css}
  </style>
</head>
<body>
  <div class="page-wrapper">
    <div class="note-container">
      {inner_html}
    </div>
    {textbox_html}
    {drawing_html}
  </div>
  <script>
    document.addEventListener("DOMContentLoaded", function() {{
        var scripts = document.querySelectorAll("script[type^='math/tex']");
        scripts.forEach(function(script) {{
            var displayMode = script.type.indexOf('mode=display') !== -1;
            var el = document.createElement(displayMode ? "div" : "span");
            el.className = displayMode ? "katex-display" : "katex";
            try {{
                katex.render(script.textContent, el, {{displayMode: displayMode, throwOnError: false}});
            }} catch (e) {{
                el.textContent = script.textContent;
            }}
            script.parentNode.replaceChild(el, script);
        }});
    }});
  </script>
</body>
</html>
"""

    async with async_playwright() as p:
        # Launch Chromium. It handles downloading its own browser on first run.
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.set_content(html_content, wait_until="networkidle")
        pdf_bytes = await page.pdf(
            format="A4",
            print_background=True,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
            display_header_footer=False,
            prefer_css_page_size=True,
        )
        await browser.close()
        
    return pdf_bytes
