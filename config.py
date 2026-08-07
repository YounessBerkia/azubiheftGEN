import os
from sys import platform

# Vielleicht später mal sinvoll
def check_os():
    if platform.startswith("linux"):
        return "Linux"
    elif platform == "darwin":
        return "Mac"
    elif platform == "win32":
        return "Windows"
        
OS_NAME = check_os()

# Ermittelt den Ursprungspfad im Projektordner
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Pfad zur SQLite-Datenbank
DB_PATH = os.path.join(BASE_DIR, "data", "berichtsheft.db")

# Ollama-Konfiguration
OLLAMA_URL = "http://localhost:11434"
OLLAMA_MODEL = "gemma4:31b-cloud"

# Flask-Konfiguration
FLASK_PORT = 5001
FLASK_HOST = "127.0.0.1"