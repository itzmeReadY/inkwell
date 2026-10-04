import re
from typing import Tuple, Dict

class MathGuard:
    def __init__(self):
        # We match block math first ($$..$$, \[..\], \begin{equation}..\end{equation})
        # Then inline math ($..$, \(..\))
        
        self.math_patterns = [
            # Block math
            r'(\$\$.*?\$\$)',                   # $$...$$
            r'(\\\[.*?\\\])',                   # \[...\]
            r'(\\begin\{equation\}.*?\\end\{equation\})', # \begin{equation}...\end{equation}
            r'(\\begin\{align\}.*?\\end\{align\})',       # \begin{align}...\end{align}
            
            # Inline math
            # Using negative lookbehind/lookahead for \$ to avoid matching escaped dollars
            r'(?<!\\)\$(?!\s|[\d])(.*?)(?<!\\)\$',    # $...$
            r'(\\\(.*?\\\))',                   # \(...\)
            
            # Bare matrices
            r'(\[\[.*?\]\])',                   # [[2,1],[1,2]]
            
            # Bare equations (heuristics: anything with = surrounded by alphanumeric/math operators)
            # This is broad, but catches things like 'Av = lambda v' and 'det(A - lambda I)=0'
            r'\b([a-zA-Z0-9\(\)\-\+\*\/\^_]+(?:\s+[a-zA-Z0-9\(\)\-\+\*\/\^_]+)*\s*=\s*[a-zA-Z0-9\(\)\-\+\*\/\^_]+(?:\s+[a-zA-Z0-9\(\)\-\+\*\/\^_]+)*)\b'
        ]
        
    def extract_math(self, text: str) -> Tuple[str, Dict[str, str]]:
        """
        Extracts math blocks and replaces them with placeholders ⟦EQn⟧.
        Returns the modified text and a dictionary mapping placeholders to original math.
        """
        equations = {}
        eq_counter = 1
        
        # We need a robust way to extract all matches sequentially to avoid overlapping issues
        # Combine patterns with OR
        combined_pattern = '|'.join(self.math_patterns)
        
        def replacement(match):
            nonlocal eq_counter
            # Find which group matched
            original_math = match.group(0)
            placeholder = f"⟦EQ{eq_counter}⟧"
            equations[placeholder] = original_math
            eq_counter += 1
            return placeholder
            
        modified_text = re.sub(combined_pattern, replacement, text, flags=re.DOTALL)
        return modified_text, equations
        
    def validate_placeholders(self, text: str, equations: Dict[str, str]) -> bool:
        """
        Checks if every placeholder in `equations` appears exactly once in `text`.
        """
        for placeholder in equations.keys():
            # count occurrences
            count = text.count(placeholder)
            if count != 1:
                return False
        return True
        
    def reinsert_math(self, text: str, equations: Dict[str, str]) -> str:
        """
        Replaces placeholders with original math strings.
        If the original math was 'bare' (not wrapped in $ or \begin), we wrap it in $ so KaTeX renders it.
        """
        result = text
        for placeholder, original_math in equations.items():
            replacement = original_math
            # Check if bare math
            if not (replacement.startswith('$') or replacement.startswith('\\[') or replacement.startswith('\\(') or replacement.startswith('\\begin')):
                replacement = f"${replacement}$"
            result = result.replace(placeholder, replacement)
        return result
