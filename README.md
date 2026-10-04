# Inkwell

Inkwell is an open-source, AI-powered tool that transforms messy, raw, plain-text lecture notes into beautifully formatted, structured PDFs with precisely rendered mathematical formulas. By combining the power of Gemma open-weight models with modern rendering technologies, Inkwell automatically distills chaotic class notes into elegant, highly readable documents and study materials.

Built for students, researchers, and engineers who type fast during lectures and need clean, structured outputs without spending hours manually formatting LaTeX.

## Features

- **Messy Text to Structured PDF:** Paste your frantic lecture notes, and let AI structure them with headings, bold definitions, and clear bullet points.
- **Automatic LaTeX Rendering:** Plain text equations like `A v = lambda v` are automatically detected, converted to KaTeX `$$A \mathbf{v} = \lambda \mathbf{v}$$`, and rendered in perfect mathematics.
- **Multiple PDF Themes & Layouts:** Choose from Dark Slate, Minimal Grid, Clean, and layouts like Two-Column Cheat Sheet or Cornell Notes.
- **Vector PDFs & Pen Annotation:** High-quality PDF export retaining vector text and math, with native tools for digital free-form drawing and highlights on top of your notes.
- **Powered by Gemma:** Powered entirely by Google's open-weight Gemma models (`gemma-2-27b-it`), prioritizing open-source AI.

## Getting Started

### Prerequisites
- Node.js & npm (for frontend)
- Python 3.12+ (for backend)
- Google AI Studio API Key (for Gemma)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/inkwell.git
   cd inkwell
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Set your Gemini API key (must have access to Gemma models)
   export GEMINI_API_KEY="your-api-key"
   
   # Run the server
   uvicorn main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open Inkwell**
   Navigate to `http://localhost:5173` in your browser.

## Tech Stack

- **Frontend:** React, Vite, ReactMarkdown, rehype-katex
- **Backend:** FastAPI, Python, Playwright (for headless DOM capture and vector PDF generation)
- **AI / LLM:** Google Gemma (`gemma-2-27b-it`) via the Google GenAI SDK.

## License

MIT License. Open source and proudly built with open-weight models.
