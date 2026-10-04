import re

text = "eigenvalue = lambda, Av = lambda v, det(A - lambda I)=0, example 2x2 [[2,1],[1,2]], let x = 5 and we find x^2 + y^2 = 25."

patterns = [
    r'(\[\[.*?\]\])', # matrices
    r'\b([a-zA-Z0-9\(\)\-\+\*\/\^]+(?:\s+[a-zA-Z0-9\(\)\-\+\*\/\^]+)*\s*=\s*[a-zA-Z0-9\(\)\-\+\*\/\^]+(?:\s+[a-zA-Z0-9\(\)\-\+\*\/\^]+)*)\b', # equations
]

for p in patterns:
    print(f"Pattern: {p}")
    matches = re.findall(p, text)
    print(matches)
