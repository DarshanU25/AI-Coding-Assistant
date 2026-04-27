import requests

payload = {
    "intent": "explain",
    "code": "def hello(): pass",
    "context": ""
}
try:
    resp = requests.post("http://localhost:8000/agent/execute", json=payload)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text}")
except Exception as e:
    print(f"Error: {e}")
