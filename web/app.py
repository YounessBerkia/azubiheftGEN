from flask import Flask, render_template, request, jsonify
from ollama.client import OllamaClient
from generator.prompts import BerichtsheftGenerator
from config import DB_PATH, OLLAMA_MODEL, OLLAMA_URL

from database.db import DatabaseManager
from datetime import datetime, timedelta

import os


WOCHENTAGE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"]

DEFAULT_REGELWERK = """
    Betrieb:
    Du schreibst den Abschnitt "Betrieb" eines deutschen Ausbildungs-Berichtshefts.

    Eingabe: Stichpunkte pro Wochentag.

    Regeln:
    - Tagesgliederung: Montag / Dienstag / Mittwoch / Donnerstag / Freitag
    - Ich-Perspektive, Präteritum
    - Max. 5 Sätze pro Tag
    - Formales Deutsch, kurze präzise Sätze
    - Konkrete Projekte, Aufgaben und Funktionen nennen
    - Berufsschultage und freie Tage weglassen

    Ausgabe: Nur den formatierten Text. Kein Vorwort, keine Erklärung.

    Format:
    Montag: ...
    Dienstag: ...

    Themen der Woche:
    Du schreibst den Abschnitt "Themen der Woche" eines deutschen Ausbildungs-Berichtshefts.

    Eingabe: Stichpunkte zu den Tätigkeiten der Woche.

    Regeln:
    - Kommagetrennte Liste technischer Schlagwörter
    - Technologien, Konzepte, Tools, Methoden
    - Max. 8 Begriffe
    - Keine ganzen Sätze

    Ausgabe: Nur die Liste. Kein Vorwort, keine Erklärung.

    Berufsschule:
    Du schreibst den Abschnitt "Berufsschule" eines deutschen Ausbildungs-Berichtshefts.

    Eingabe: Stichpunkte zu Berufsschulthemen.

    Regeln:
    - Ich-Perspektive, Präteritum
    - Max. 5 Sätze pro Schultag
    - Fächer, Themen und Inhalte nennen
    - Formales Deutsch
    - Kein Berufsschulunterricht → "In dieser Woche fand kein Berufsschulunterricht statt."

    Ausgabe: Nur den formatierten Text. Kein Vorwort, keine Erklärung. 
    """

def create_app():
    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static"
    )

    app.db = DatabaseManager(DB_PATH)

    ollama_client = OllamaClient(OLLAMA_URL, OLLAMA_MODEL)
    app.generator = BerichtsheftGenerator(ollama_client)


    @app.route("/")
    def index():
        current_date = datetime.now()
        current_week = current_date.isocalendar().week
        current_year = current_date.year

        name = "Youness"

        monday = current_date - timedelta(days=current_date.weekday())
        week_days = [
            {
                "name": tag,
                "date": (monday + timedelta(days=i)).strftime("%d.%m.%Y"),
                "slug": tag.lower(),
            }
            for i, tag in enumerate(WOCHENTAGE)
        ]

        return render_template(
            "index.html",
            current_week=current_week,
            current_year=current_year,
            name=name,
            week_days=week_days,
        )

    @app.route("/entry/save", methods=["POST"])
    def entry_save():
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        date = data.get("date")
        betrieb = data.get("betrieb", "")
        themen = data.get("themen", "")
        berufsschule = data.get("berufsschule", "")

        parsed_date = datetime.fromisoformat(date)
        week_number = parsed_date.isocalendar().week
        year = parsed_date.isocalendar().year

        app.db.save_entry(date, betrieb, themen, berufsschule, week_number, year)
        return jsonify({"status": "ok"}), 200



    @app.route("/report/generate/<int:year>/<int:week>", methods=["POST"])
    def report_generate(year, week):
        entries = app.db.get_week_entries(week, year)

        work_entries = []
        school_entries = []

        for entry in entries:
            tag = WOCHENTAGE[datetime.fromisoformat(entry["date"]).weekday()]

            if entry["betrieb"]:
                text = f"{tag}: {entry['betrieb']}"
                if entry["themen"]:
                    text += f" (Notierte Themen: {entry['themen']})"
                work_entries.append(text)

            if entry["berufsschule"]:
                school_entries.append(f"{tag}: {entry['berufsschule']}")


        try:
            result = app.generator.generate_report(work_entries, school_entries, DEFAULT_REGELWERK)
        except ConnectionError as e:
            return jsonify({"status": "error", "message": str(e)}), 503

        app.db.save_report(
            week,
            year,
            result["taetigkeit"],
            result["themen"],
            result["berufsschule"]
        )

        return jsonify({
            "status": "ok",
            "taetigkeit": result["taetigkeit"],
            "themen": result["themen"],
            "berufsschule": result["berufsschule"]
        }), 200



    @app.route("/bericht")
    def bericht():
        current_date = datetime.now()
        current_week = current_date.isocalendar().week
        current_year = current_date.year

        return render_template(
            "report.html",
            current_week=current_week,
            current_year=current_year,
        )

    @app.route("/ollama-regelwerk")
    def ollama_regelwerk():
        current_date = datetime.now()
        current_week = current_date.isocalendar().week
        current_year = current_date.year

        return render_template(
            "rules.html",
            current_week=current_week,
            current_year=current_year,
        )

    return app