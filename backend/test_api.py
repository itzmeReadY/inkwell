import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_api_post():
    payload = { 'theme': 'grid', 'font': 'architect', 'layout': 'single', 'pages': [ { 'markdown': r'''<li><strong>Matrix Powers</strong>: Matrix powers can be computed efficiently via diagonalization:
$$A^k = P D^k P^{-1}$$
where $P$ is the matrix of eigenvectors and $D$ is the diagonal matrix of eigenvalues.</li>''' } ] }
    response = client.post('/api/compile-pdf', json=payload)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 1000  # Ensure valid PDF output is generated
