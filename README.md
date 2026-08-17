![Berichtsheft-Generator](Berichtsheft-Banner.jpg)

# Berichtsheft-Generator

Ein persönliches Tool für die Ausbildung (Fachinformatiker Anwendungsentwicklung): Du trägst täglich kurze Stichpunkte zu deiner Arbeit ein, und lässt daraus freitags per Knopfdruck mit einem lokalen KI-Modell ([Ollama](https://ollama.com)) drei fertige Texte für dein Ausbildungsportal generieren – **Ausgeführte Tätigkeit**, **Themen der Woche** und **Berufsschule**. Läuft komplett lokal, keine Cloud-API, keine Kosten pro Anfrage.

## Wie es funktioniert

1. **Montag bis Freitag**: Für jeden Tag kurze Stichpunkte zu Betrieb, Themen und Berufsschule eintragen – dauert ein, zwei Minuten und wird automatisch beim Verlassen eines Feldes gespeichert.
2. **Freitags**: Auf "Berichtsheft generieren" klicken. Die Wochendaten werden zusammen mit einem editierbaren Regelwerk an Ollama geschickt.
3. **Fertig**: Die drei generierten Texte lassen sich mit einem Klick in die Zwischenablage kopieren und direkt ins Ausbildungsportal einfügen.

## Features

- **Tägliche Schnellerfassung** – drei Felder pro Tag (Betrieb, Themen der Woche, Berufsschule), Auto-Save beim Verlassen eines Feldes
- **KI-Generierung mit Ollama** – ein einziger Prompt pro Woche (statt drei), inklusive automatischer Retry-Logik, falls die KI-Antwort nicht sauber verarbeitet werden kann
- **Editierbares Regelwerk** – die Anweisungen, nach denen die KI schreibt (Tonfall, Format, Länge), lassen sich direkt im Browser anpassen und werden dauerhaft gespeichert
- **Berichts-Verlauf** – alle generierten Wochenberichte bleiben gespeichert, einzeln abrufbar und löschbar
- **Kopieren-Buttons** – jeder generierte Abschnitt lässt sich mit einem Klick in die Zwischenablage kopieren
- **Dark Mode** – inklusive Speicherung der Wahl im Browser
- **Netzwerkfähig** – standardmäßig im Heimnetz von anderen Geräten erreichbar (z. B. vom Handy aus)

## Tech-Stack

| Bereich    | Technologie                                |
|------------|---------------------------------------------|
| Backend    | Python, Flask                                |
| Datenbank  | SQLite (kein ORM, reines `sqlite3`)          |
| KI         | [Ollama](https://ollama.com) (lokale REST-API, kein API-Key nötig) |
| Frontend   | Jinja2-Templates, Vanilla JavaScript (ES6, kein Framework), reines CSS |

## Projektstruktur

```
azubiheftGEN/
├── main.py                    # Startpunkt der Anwendung
├── config.py                  # Konfiguration (DB-Pfad, Ollama-URL/-Modell, Flask-Host/-Port)
├── requirements.txt
│
├── database/
│   ├── db.py                  # DatabaseManager – alle DB-Zugriffe
│   └── schema.sql             # Tabellenstruktur (entries, reports, einstellungen)
│
├── ollama/
│   └── client.py              # Schlanker Client für die Ollama-API
│
├── generator/
│   └── prompts.py             # Baut den Prompt und parst die KI-Antwort
│
├── web/
│   ├── app.py                 # Flask-Routes
│   ├── templates/             # Jinja2-Templates (Übersicht, Bericht, Regelwerk)
│   └── static/
│       ├── css/                # Styling (Light/Dark-Theme, Notizbuch-Optik)
│       └── js/app.js           # Auto-Save, Generieren, Kopieren, Dark-Mode-Toggle
│
└── data/                      # SQLite-Datenbank (wird automatisch erzeugt, nicht versioniert)
```

## Installation

### 1. Ollama installieren und Modell laden

```bash
# https://ollama.com/download

ollama pull llama3.2        # empfohlen: schnell, gut auf Deutsch, ~2 GB
# oder z. B. ollama pull mistral für bessere, aber langsamere Ergebnisse

# Prüfen ob Ollama läuft:
ollama serve
```

### 2. Python-Umgebung einrichten

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

### 3. Konfiguration prüfen

In [`config.py`](config.py) ggf. anpassen:

```python
OLLAMA_MODEL = "llama3.2"     # welches Ollama-Modell verwendet wird
FLASK_PORT = 5001
FLASK_HOST = "0.0.0.0"        # im Heimnetz erreichbar – für rein lokale Nutzung auf "127.0.0.1" ändern
```

### 4. Starten

```bash
python main.py
```

Die App läuft anschließend unter `http://127.0.0.1:5001` (bzw. unter der lokalen Netzwerk-IP, wenn `FLASK_HOST = "0.0.0.0"`).

## Das Regelwerk

Unter **Ollama-Regelwerk** lässt sich direkt im Browser festlegen, *wie* die KI schreiben soll – Perspektive, Zeitform, maximale Satzanzahl, Format der Ausgabe usw. Die Datenbank enthält dazu einen sinnvollen Standardtext; Änderungen werden dauerhaft gespeichert und bei jeder Generierung verwendet.

## Warum kein Cloud-LLM?

Ausbildungsinhalte und persönliche Tagesnotizen sollen nicht bei einem externen Anbieter landen. Mit Ollama läuft alles lokal auf dem eigenen Rechner – keine Internetverbindung nötig (außer beim einmaligen Herunterladen des Modells), keine laufenden Kosten, volle Kontrolle über die Daten.

---

*Persönliches Projekt im Rahmen der Ausbildung zum Fachinformatiker Anwendungsentwicklung.*
