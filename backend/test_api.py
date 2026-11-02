import requests
def test_compile_pdf_endpoint():
    payload = { 'theme': 'grid', 'font': 'architect', 'layout': 'single', 'pages': [ { 'markdown': r'''<li><strong>Matrix Powers</strong>: Matrix powers can be computed efficiently via diagonalization:
$$A^k = P D^k P^{-1}$$
where $P$ is the matrix of eigenvectors and $D$ is the diagonal matrix of eigenvalues.</li>''' } ] }
    if __name__ == '__main__':
        requests.post('http://127.0.0.1:8000/api/compile-pdf', json=payload)

if __name__ == '__main__':
    test_compile_pdf_endpoint()
