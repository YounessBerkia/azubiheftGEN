import requests

class OllamaClient:
    def __init__(self, base_url, model):
        self.base_url = base_url
        self.model = model

    def is_available(self):
        try:
            response = requests.get(self.base_url)
            response.raise_for_status()
            return True

        except requests.RequestException:
            return False

    def generate(self, prompt):
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "stream": False
        }
        try:
            response = requests.post(url, json=payload, timeout=120)
            response.raise_for_status()
            return response.json()['message']['content']

        except requests.RequestException as e:
            raise ConnectionError("Ollama API request failed - Ollama läuft wahrscheinlich nicht, ist der Server aktiv?") from e

    