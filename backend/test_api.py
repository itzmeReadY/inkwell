import requests
payload = { 'theme': 'grid', 'font': 'architect', 'layout': 'single', 'pages': [ { 'markdown': r'''<li><strong>Matrix Powers</strong>: Matrix powers can be computed efficiently via diagonalization:
$$A^k = P D^k P^{-1}$$
where $P$ is the matrix of eigenvectors and $D$ is the diagonal matrix of eigenvalues.</li>''' } ] }
requests.post('http://127.0.0.1:8000/api/compile-pdf', json=payload)
