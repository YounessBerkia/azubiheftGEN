from flask import Flask, render_template
from database.db import DatabaseManager
from config import DB_PATH
from datetime import datetime, timedelta

import os


WOCHENTAGE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"]


def create_app():
    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static"
    )

    app.db = DatabaseManager(DB_PATH)


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