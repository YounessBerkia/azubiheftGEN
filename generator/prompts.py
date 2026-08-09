class BerichtsheftGenerator:
    def __init__(self, ollama_client):
        self.ollama_client = ollama_client

    def generate_report(self, work_entries: list[str], school_entries: list[str], regelwerk: str):        
        work_text = "\n".join(work_entries)
        school_text = "\n".join(school_entries)