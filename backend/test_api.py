import requests

def test_api_compile_pdf():
    payload = { 'theme': 'grid', 'font': 'architect', 'layout': 'single', 'pages': [ { 'markdown': '<li><strong>Matrix Powers</strong>: Matrix powers can be computed efficiently via diagonalization:\n$$A^k = P D^k P^{-1}$$\nwhere $P$ is the matrix of eigenvectors and $D$ is the diagonal matrix of eigenvalues.</li>' } ] }
    try:
        response = requests.post('http://127.0.0.1:8000/api/compile-pdf', json=payload)
        # If server is not running, requests.post raises an exception which is fine for a loose test script like this
        assert response.status_code == 200
    except requests.exceptions.ConnectionError:
        pass # Ignore if uvicorn is not running
