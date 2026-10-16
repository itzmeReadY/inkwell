import requests

def test_dummy():
    # This file seems to have had invalid syntax.
    # It was running top-level API requests. Memory says:
    # "Avoid top-level side effects (e.g., direct API calls) in backend test files; wrap execution code in `if __name__ == '__main__':` to prevent unintended execution during pytest collection."
    pass

if __name__ == '__main__':
    payload = { 'theme': 'grid', 'font': 'architect', 'layout': 'single', 'pages': [ { 'markdown': r'<li><strong>Matrix Powers</strong>: Matrix powers can be computed efficiently via diagonalization:\n$$A^k = P D^k P^{-1}$$\nwhere $P$ is the matrix of eigenvectors and $D$ is the diagonal matrix of eigenvalues.</li>' } ] }
    requests.post('http://127.0.0.1:8000/api/compile-pdf', json=payload)
