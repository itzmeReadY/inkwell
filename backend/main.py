import re
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from dotenv import load_dotenv
import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
import markdown as md_lib

load_dotenv()

from math_guard import MathGuard
import llm
from pdf_compiler import compile_html_to_pdf, THEME_STYLES, FONT_FAMILIES

app = FastAPI(title="Inkwell API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CleanRequest(BaseModel):
    text: str
    layout: Optional[str] = "single"

class CleanResponse(BaseModel):
    markdown: str
    equations_total: int
    equations_preserved: int
    recovered: bool = False

class TextBoxData(BaseModel):
    id: Optional[str] = None
    text: str
    x: float = 0
    y: float = 0
    color: str = "#1e293b"
    fontSize: int = 20

class PageData(BaseModel):
    html: Optional[str] = None
    markdown: Optional[str] = None
    drawings: Optional[List[str]] = None
    textBoxes: Optional[List[TextBoxData]] = None

class CompilePdfRequest(BaseModel):
    pages: Optional[List[PageData]] = None
    # Legacy single-page fields
    html: Optional[str] = None
    markdown: Optional[str] = None
    theme: str = "grid"
    font: str = "architect"
    layout: Optional[str] = "single"
    filename: Optional[str] = "inkwell-notes.pdf"
    drawings: Optional[List[str]] = None
    textBoxes: Optional[List[TextBoxData]] = None

math_guard = MathGuard()

@app.post("/api/clean", response_model=CleanResponse)
async def clean_notes(request: CleanRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
        
    # Call Gemma AI to convert plain text into clean Markdown + proper LaTeX formulas
    try:
        final_markdown = llm.generate(request.text, layout=request.layout or "single")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemma AI generation failed: {str(e)}")
        
    # Count LaTeX formulas generated in the notes
    display_eqs = len(re.findall(r'\$\$[\s\S]*?\$\$', final_markdown))
    inline_eqs = len(re.findall(r'(?<!\$)\$(?!\$)[^\$\n]+(?<!\$)\$(?!\$)', final_markdown))
    total_eqs = display_eqs + inline_eqs

    return CleanResponse(
        markdown=final_markdown,
        equations_total=total_eqs,
        equations_preserved=total_eqs,
        recovered=False
    )

import re

def fix_math_html(html_str: str) -> str:
    """
    mdx_math forces all $$ to be mode=display.
    If a display math script is inside a block tag (like p, li, td) with other text, it should be inline.
    """
    def repl(match):
        open_tag = match.group(1)
        tag_name = match.group(2)
        content = match.group(3)
        close_tag = match.group(4)
        
        # Check if there's text other than scripts
        text_only = re.sub(r'<script.*?</script>', '', content, flags=re.DOTALL)
        # Also remove other HTML tags to check pure text
        text_only = re.sub(r'<[^>]+>', '', text_only)
        if text_only.strip():
            # Block contains other text, so display math should be inline
            content = content.replace('type="math/tex; mode=display"', 'type="math/tex"')
        return f"{open_tag}{content}{close_tag}"
    
    return re.sub(r'(<(p|li|td|th|blockquote|h[1-6])[^>]*>)(.*?)(</\2>)', repl, html_str, flags=re.DOTALL)

@app.post("/api/compile-pdf")
async def export_compiled_pdf(request: CompilePdfRequest):
    # Determine content: multi-page or single-page
    if request.pages and len(request.pages) > 0:
        # Multi-page: combine all pages' HTML
        page_htmls = []
        all_drawings = []
        all_textboxes = []
        
        for page in request.pages:
            content_html = page.html
            if not content_html and page.markdown:
                content_html = fix_math_html(md_lib.markdown(
                    page.markdown,
                    extensions=['extra', 'fenced_code', 'tables', 'mdx_math'],
                    extension_configs={'mdx_math': {'enable_dollar_delimiter': True}}
                ))
            if content_html and content_html.strip():
                page_htmls.append(content_html)
                if page.drawings:
                    all_drawings.extend(page.drawings)
                if page.textBoxes:
                    all_textboxes.extend([tb.model_dump() for tb in page.textBoxes])
        
        if not page_htmls:
            raise HTTPException(status_code=400, detail="No page content provided.")
        
        # Join pages with page break markers
        combined_html = '<div style="page-break-after:always;"></div>'.join(page_htmls)
        drawings = all_drawings if all_drawings else None
        textboxes = all_textboxes if all_textboxes else None
    else:
        # Legacy single-page
        content_html = request.html
        if not content_html and request.markdown:
            content_html = fix_math_html(md_lib.markdown(
                request.markdown,
                extensions=['extra', 'fenced_code', 'tables', 'mdx_math'],
                extension_configs={'mdx_math': {'enable_dollar_delimiter': True}}
            ))
        if not content_html or not content_html.strip():
            raise HTTPException(status_code=400, detail="Either 'html' or 'markdown' content must be provided.")
        
        combined_html = content_html
        drawings = request.drawings
        textboxes = [tb.model_dump() for tb in request.textBoxes] if request.textBoxes else None
        
    try:
        import sys
        if sys.platform == "win32":
            from fastapi.concurrency import run_in_threadpool
            def sync_compile():
                import asyncio
                loop = asyncio.ProactorEventLoop()
                asyncio.set_event_loop(loop)
                try:
                    return loop.run_until_complete(compile_html_to_pdf(
                        inner_html=combined_html,
                        theme=request.theme,
                        font=request.font,
                        layout=request.layout or "single",
                        drawings=drawings,
                        textboxes=textboxes,
                    ))
                finally:
                    loop.close()
            pdf_bytes = await run_in_threadpool(sync_compile)
        else:
            pdf_bytes = await compile_html_to_pdf(
                inner_html=combined_html,
                theme=request.theme,
                font=request.font,
                layout=request.layout or "single",
                drawings=drawings,
                textboxes=textboxes,
            )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"PDF compilation failed: {str(e)}")
        
    if request.filename:
        import os
        # Prevent path traversal by keeping only the basename
        safe_filename = os.path.basename(request.filename)
        # Prevent HTTP Header Injection by stripping newlines, carriage returns, and quotes
        safe_filename = safe_filename.replace('"', "").replace("\n", "").replace("\r", "")
        # Fallback if the filename becomes empty after sanitization
        if not safe_filename.strip():
            safe_filename = f"inkwell-notes-{request.theme}.pdf"
    else:
        safe_filename = f"inkwell-notes-{request.theme}.pdf"

    if not safe_filename.endswith(".pdf"):
        safe_filename += ".pdf"
        
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{safe_filename}"',
            "Content-Type": "application/pdf"
        }
    )

@app.get("/api/pdf-options")
async def get_pdf_options():
    return {
        "themes": list(THEME_STYLES.keys()),
        "fonts": list(FONT_FAMILIES.keys())
    }
