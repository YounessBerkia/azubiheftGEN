MARKER_TAETIGKEIT = "###TAETIGKEIT###"
MARKER_THEMA = "###THEMA###"
MARKER_BERUFSSCHULE = "###BERUFSSCHULE###"


class BerichtsheftGenerator:
    def __init__(self, ollama_client):
        self.ollama_client = ollama_client

    def generate_report(self, work_entries: list[str], school_entries: list[str], regelwerk: str):
        work_text = "\n".join(work_entries)
        school_text = "\n".join(school_entries)

        if school_entries:
            berufsschule_hinweis = "Formuliere daraus einen kurzen, formellen Text (2-3 Sätze, Präteritum)."
        else:
            berufsschule_hinweis = "Es gab diese Woche keine Berufsschule. Schreibe für diesen Abschnitt genau: 'In dieser Woche fand kein Berufsschulunterricht statt.'"

        daten_teil = f"""
            Betrieb-Stichpunkte der Woche:
            {work_text}

            Berufsschule-Stichpunkte:
            {school_text}

            Hinweis zur Berufsschule: {berufsschule_hinweis}
            """

        
        format_anweisung = f"""
            Gib deine Antwort EXAKT in folgendem Format aus, mit genau diesen drei Markern:

            {MARKER_TAETIGKEIT}
            <Text für Betrieb>
            {MARKER_THEMA}
            <Text für Themen der Woche>
            {MARKER_BERUFSSCHULE}
            <Text für Berufsschule>

            Keine zusätzlichen Erklärungen, kein Vorwort, keine Kommentare außerhalb der Marker.
            """


        prompt = regelwerk + "\n\n" + daten_teil + "\n\n" + format_anweisung
        response = self.ollama_client.generate(prompt)


        taetigkeit = response.split(MARKER_TAETIGKEIT)[1].split(MARKER_THEMA)[0].strip()
        themen = response.split(MARKER_THEMA)[1].split(MARKER_BERUFSSCHULE)[0].strip()
        berufsschule = response.split(MARKER_BERUFSSCHULE)[1].strip()

        return {
            "taetigkeit": taetigkeit,
            "themen": themen,
            "berufsschule": berufsschule
        }