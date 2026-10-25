import requests

payload = {
    'theme': 'grid',
    'font': 'architect',
    'layout': 'single',
    'pages': [
        { 'markdown': r'<li><strong>Matrix Powers</strong>: Matrix powers can be computed efficiently via diagonalization:\n$$A^k = P D^k P^{-1}$$\nwhere $P$ is the matrix of eigenvectors and $D$ is the diagonal matrix of eigenvalues.</li>' }
    ]
}

if __name__ == "__main__":
    try:
        response = requests.post('http://127.0.0.1:8000/api/compile-pdf', json=payload)
        print(f"Status: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("API is not running on 8000")
