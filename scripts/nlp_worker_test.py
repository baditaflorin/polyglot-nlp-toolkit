import json
import subprocess
import sys


def test_worker_returns_tokens():
    payload = {
        "documents": ["Bucuresti este capitala Romaniei."],
        "operations": ["detect", "tokenize", "embed", "cluster"],
        "clusterCount": 1,
    }
    process = subprocess.run(
        [sys.executable, "scripts/nlp_worker.py"],
        input=json.dumps(payload),
        text=True,
        capture_output=True,
        check=True,
    )
    response = json.loads(process.stdout)
    assert response["documents"][0]["language"] in {"ro", "und"}
    assert response["documents"][0]["tokens"]
    assert response["clusters"]
