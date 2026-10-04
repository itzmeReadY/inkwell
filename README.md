# Inkwell Notes

A privacy-focused STEM note-taking app that turns messy plain-text notes into beautiful PDF cheat sheets with LaTeX math.

## Quick Start (3 Easy Steps)

**Step 1: Install Ollama & Pull Model (Optional, for Local Privacy Mode)**
Download and install [Ollama](https://ollama.com/) for your operating system.
Open your terminal / command prompt and download the local AI model:
\\\ash
ollama pull gemma2:2b
\\\`n
**Step 2: Install Python Dependencies**
Open your terminal in the \ackend\ directory and install the dependencies:
\\\ash
cd backend
pip install -r requirements.txt
\\\`n
**Step 3: Launch the Application**
Start the backend server:
\\\ash
cd backend
uvicorn main:app --reload
\\\`n
Start the frontend development server:
\\\ash
cd frontend
npm install
npm run dev
\\\`n
## Features
- **Cloud & Local AI**: Choose between Google Gemini (Cloud) or Ollama (Local) for generating notes.
- **Math Rendering**: Automatically converts formulas to beautiful KaTeX/LaTeX.
- **PDF Export**: Generates A4 PDF cheat sheets matching the handwritten style of the preview.

