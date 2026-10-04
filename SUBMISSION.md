*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)*

## What I Built

I built **Inkwell** — an open-source, AI-powered tool that transforms messy, raw, plain-text lecture notes into publication-grade structured study guides and vector PDFs with precisely rendered mathematical formulas ($\LaTeX$ / KaTeX).

### Who I Built It For & The Problem
I built Inkwell for my friend and study partner **Asuna**, a third-year engineering and computer science student. 

During dense STEM lectures like Linear Algebra, Differential Equations, and Machine Learning, professors talk and write at lightning speed. Asuna types fast in plain text (Notepad or quick Markdown notes) to keep up:
```text
eigenvalues lecture:
matrix A times vector v equals lambda v. A v = lambda v
det(A - lambda I) = 0 is characteristic eq
example matrix [[2, 1], [1, 2]]
trace is sum of diags, det is prod of lambdas
remember: symmetric matrices always have real eigenvalues!
```

By the time the lecture ends, the notes are an unstructured, chaotic wall of text. Shorthand formulas like `Av = lambda v` or `[[2,1],[1,2]]` are painful to review when studying for midterms. Asuna used to spend **3 to 4 hours every weekend** manually converting notes into $\LaTeX$ or Notion formulas just to make them readable.

### The Solution: Inkwell
With **Inkwell**, Asuna simply pastes raw, frantic notes, picks a layout, and clicks **"Clean & Format Notes"**:
1. **Instant Math Recognition:** Plain equations like `Av = lambda v` and raw matrices `[[2, 1], [1, 2]]` are automatically detected and converted into gorgeous KaTeX expressions:
   $$A \mathbf{v} = \lambda \mathbf{v}, \quad \det(A - \lambda I) = 0$$
   $$\begin{bmatrix} 2 & 1 \\ 1 & 2 \end{bmatrix}$$
2. **Pedagogical Layouts:** Notes can be formatted in:
   - **Single Page Document** for comprehensive reading
   - **Two-Column Cheat Sheet** for quick exam revision
   - **Cornell Notes** featuring cue questions, structured key takeaways, and summary blocks
3. **Interactive Canvas & Pen Annotation:** Asuna can draw freehand diagrams, highlight critical formulas, or drop movable sticky annotations directly over the rendered math.
4. **Vector PDF Compilation:** Headless rendering creates print-ready, crisp vector PDFs that preserve exact mathematical fonts and user annotations.

---

## Demo

![Inkwell Demo Preview](https://raw.githubusercontent.com/itzmeReadY/inkwell/main/frontend/src/assets/demo-preview.png)

- **GitHub Repository:** [https://github.com/itzmeReadY/inkwell](https://github.com/itzmeReadY/inkwell)
- **Live Demo Link:** *[Add your deployed URL here, e.g., https://inkwell-app.vercel.app or Render]*

### Key Interactions
- **Live Markdown + Math Split Screen:** Instant side-by-side editing and KaTeX rendering.
- **Theme Switcher:** Switch between *Dark Slate*, *Minimal Grid*, and *Clean Academic*.
- **Canvas Overlay:** Free-form pen, highlighter, eraser, and custom text boxes layered directly on top of the note pages.
- **Export to Vector PDF:** Instant download with vector typography and embedded math.

---

## Code

{% github https://github.com/itzmeReadY/inkwell %}

### Tech Stack
- **AI Core:** Google Gemma open-weight models (`gemma-4-31b-it` / `gemma-4-26b-a4b-it` / `gemma-2-27b-it`).
- **Backend:** FastAPI, Python, Playwright (for headless vector PDF rendering).
- **Frontend:** React 18, TypeScript, Vite, ReactMarkdown, Rehype-KaTeX, HTML5 Canvas annotation engine.
- **Hosting:** Render (Docker Web Service for the backend, Static Site for the frontend).
- **License:** MIT License (100% open source).

---

## How I Built It

### 1. Powered by Google Gemma Open-Weight Models
Inkwell is built specifically around Google's open-weight **Gemma** family (`gemma-4-31b-it`, `gemma-4-26b-a4b-it`, and `gemma-2`). 

We crafted a specialized STEM-instruct prompt in `llm.py` that instructs Gemma to:
- Parse chaotic plain-text math notation (e.g. `lambda`, `alpha`, fractions like `a/b`, summations, and matrix rows) into valid $\LaTeX$ delimiters (`$...$` for inline, `$$...$$` for block math).
- Restructure stream-of-consciousness text into hierarchical sections (`#`, `##`, `###`), bold terms, and digestible bullet points.
- Adapt structure depending on the requested layout mode:
  - In **Cornell mode**, Gemma generates `**CUE:**` memory cues, detailed explanation blocks, and a `## Summary` section.
  - In **Two-Column mode**, Gemma produces dense, punchy bullet points optimized for column distribution.

```python
# backend/llm.py excerpt
CANDIDATE_MODELS = [
    "gemma-4-31b-it",
    "gemma-4-26b-a4b-it",
    "gemma-2-27b-it",
    "gemma-2-9b-it",
]

prompt = f"""You are an expert STEM note-taking AI. Convert these raw, plain-text, messy lecture notes into clean, structured notes in Markdown with proper LaTeX/KaTeX math equations.
...
CRITICAL INSTRUCTIONS:
1. NO RAW PLAIN MATH: Convert ALL mathematical symbols, equations, formulas, matrices, and variables into proper LaTeX.
2. Clean Structure: Organize into clean sections with Markdown headings, bullet points, and bold key definitions.
"""
```

### 2. Math Guard Heuristics
To prevent accidental formula mangling or hallucinated transformations, we implemented `MathGuard` (`backend/math_guard.py`). It uses heuristic regex tokenization to identify raw math equations (like `A v = lambda v`), extracts them into isolated placeholders (`⟦EQ1⟧`, `⟦EQ2⟧`), verifies placeholder integrity through the LLM pass, and safely reinserts them formatted in KaTeX math tags.

### 3. Integrated Freehand Canvas & Sticky Annotations
Notes aren't static text — engineering students need to draw coordinate axes, circle critical exam concepts, and write marginalia. 
Inkwell features an HTML5 canvas overlay (`DrawingCanvas.tsx` and `TextBoxLayer.tsx`) that supports:
- Smooth freehand pen drawing with customizable stroke widths and colors
- Semi-transparent highlighter strokes
- Movable, re-sizable text annotations that sit directly above the rendered KaTeX equations

### 4. Headless Vector PDF Engine
Standard browser `window.print()` often produces rasterized or clipped math expressions. Inkwell uses a dedicated backend route (`/api/compile-pdf`) with Playwright to compile the final study guide into a multi-page, crisp vector PDF. To ensure the PDF is a 1:1 match with what the user sees, the React frontend serializes its live, KaTeX-rendered DOM and sends the raw HTML directly to the backend instead of re-parsing Markdown on the server.

### 5. Putting it on Render
Gemma does the thinking, and Render hosts the part people actually open. The frontend is deployed on Render as a Static Site, and the backend runs as a free Docker Web Service. Because Playwright requires heavy OS-level Chromium dependencies, using Render's Docker deployment allowed us to use Microsoft's official Playwright image so PDF generation works out of the box. Asuna (or anyone else) can use Inkwell from a link, with nothing to install and no setup before a study session.

---

## Why Does Open Innovation Matter?

### 1. Students Shouldn't Depend on Closed $20/Month Walled Gardens
Most commercial "AI study tools" are built on proprietary closed APIs, charging monthly subscription fees that students on a tight budget cannot afford. Open-weight models like **Gemma** make state-of-the-art AI accessible to anyone with a laptop.

### 2. Privacy & Academic Integrity
Lecture notes often contain unpublished research, university lab data, or personal study logs. Proprietary AI services reserve the right to ingest user prompts into their training pipelines. With open-weight models, students have full sovereignty over their academic data: they can run Gemma locally via Ollama or vLLM with zero data leakage.

### 3. Modifiability & Community Freedom
Because Inkwell is fully open-source (MIT), students can customize the LaTeX rendering rules, add support for chemistry formulas (ChemDraw/mhchem), contribute custom university thesis themes, or self-host their own offline note-taking instance in lecture halls without internet access.

---

## My Agent Session

This project was built and iterated with the assistance of AI agent tooling:
<!-- If you saved your agent session with DevRelay, embed it here: -->
<!-- {% devrelay_session YOUR_SESSION_ID %} -->

*Session log & repository workflow preserved with DevRelay.*

---

## Prize Categories

I am submitting Inkwell for the following categories:

- **Best Use of Gemma:** Inkwell is built around Google's open-weight Gemma models, which turn raw STEM notes into clean Markdown and accurate LaTeX.
- **Best Use of Render:** The entire Inkwell stack is deployed on Render. The frontend is a globally distributed static site, and the FastAPI backend uses a Render Docker Web Service to easily handle Playwright's system-level Chromium dependencies on the Free tier.
- **Overall Hacktoberfest Weekend Challenge: Build for a Friend:** Built specifically to solve Asuna's real-world struggle with messy lecture notes, saving hours of manual LaTeX formatting every week.
---

*Made with ❤️ for Hacktoberfest 2026.*
