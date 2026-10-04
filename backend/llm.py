from google import genai
import os
import re

# Gemma models hosted via Google AI Studio API with fast fallbacks
CANDIDATE_MODELS = [
    "gemma-4-26b-a4b-it",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-flash-latest"
]

import requests

def generate(text: str, layout: str = "single", ai_model: str = "cloud") -> str:
    """
    Calls the AI API to convert raw, messy, plain-text lecture notes
    into clean, structured Markdown with proper LaTeX/KaTeX math formulas.
    Supports Google AI Studio (Gemma/Gemini) and local Ollama (gemma2:2b).
    """
    layout_instruction = ""
    if layout == "two-column":
        layout_instruction = """
4. TWO-COLUMN CHEAT SHEET LAYOUT:
   - Format notes with compact, punchy bullet points and dense formula blocks.
   - Use clear `## Heading` sections so topics distribute cleanly across two columns.
   - Keep display math concise and readable in narrow columns.
"""
    elif layout == "cornell":
        layout_instruction = """
4. CORNELL NOTES LAYOUT:
   - Begin key conceptual points with `**CUE:**` or `**Key Question:**` to facilitate recall.
   - Provide clear, detailed explanations and equations under structured headings.
   - End with a `## Summary` section capturing the core principles.
"""
    
    prompt = f"""You are an expert STEM note-taking AI. Convert these raw, plain-text, messy lecture notes into clean, structured notes in Markdown with proper LaTeX/KaTeX math equations.

CRITICAL INSTRUCTIONS:
1. NO RAW PLAIN MATH: Convert ALL mathematical symbols, equations, formulas, matrices, and variables into proper LaTeX:
   - Use single dollar signs `$ ... $` for inline math, variables, and short expressions (e.g., `$x$`, `$\\lambda$`, `$A \\mathbf{{v}} = \\lambda \\mathbf{{v}}$`).
   - Use double dollar signs `$$ ... $$` on their own lines for key equations, display formulas, and matrices.
   - For matrices, convert plain text like `[[a,b],[c,d]]` or row descriptions into proper LaTeX: `\\begin{{bmatrix}} a & b \\\\ c & d \\end{{bmatrix}}`.
   - Convert Greek words into LaTeX commands (e.g., lambda -> `\\lambda`, theta -> `\\theta`, alpha -> `\\alpha`).
   - Convert fractions like (a/b) into `\\frac{{a}}{{b}}` and roots into `\\sqrt{{...}}`.
   - Convert operators like det, lim, sum into `\\det`, `\\lim`, `\\sum`.
2. Clean Structure:
   - Organize into clean sections with Markdown headings (`#`, `##`, `###`).
   - Use bullet points (`- `) and bold key definitions (`**term**`).
   - Fix informal spelling, expand abbreviations, but strictly preserve all facts and numerical values.
3. Output ONLY the clean Markdown with LaTeX math. Do NOT add conversational preamble, greetings, or wrap the whole response in triple backticks.
{layout_instruction}
Raw Plain Text Notes:
{text}
"""

    if ai_model == "local":
        try:
            response = requests.post("http://127.0.0.1:11434/api/generate", json={
                "model": "gemma2:2b",
                "prompt": prompt,
                "stream": False
            })
            response.raise_for_status()
            output = response.json().get("response", "").strip()
            return _clean_markdown_output(output)
        except Exception as e:
            raise RuntimeError(f"Local Ollama generation failed. Make sure Ollama is running and gemma2:2b is pulled. Error: {e}")
    else:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
            
        client = genai.Client(api_key=api_key)
        last_error = None
        for model_name in CANDIDATE_MODELS:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                output = response.text.strip()
                return _clean_markdown_output(output)
            except Exception as e:
                last_error = e
                continue
                
        raise RuntimeError(f"All candidate models failed. Last error: {last_error}")

def _clean_markdown_output(output: str) -> str:
    if output.startswith("```markdown"):
        output = output[11:]
    elif output.startswith("```"):
        output = output[3:]
    if output.endswith("```"):
        output = output[:-3]
    return output.strip()
