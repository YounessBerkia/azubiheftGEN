from datetime import datetime

import sqlite3
import os

class DatabaseManager:

    def __init__(self, db_path):
        self.db_path = db_path

        self.connection = sqlite3.connect(db_path)
        self.connection.row_factory = sqlite3.Row

        self.connection.execute(
            "PRAGMA foreign_keys = ON"
        )

        self._create_schema()




    def _create_schema(self):
        # Nimmt den Pfad dieser db.py datei und dirname entfernt die Datei aus dem Pfad und setzt schema.sql dahinter
        schema_path = os.path.join(
            os.path.dirname(__file__),
            "schema.sql"
        )

        with open(schema_path, "r", encoding="utf-8") as f:
            schema = f.read()

        self.connection.executescript(schema)
        self.connection.commit()




    def save_entry(
        self,
        date,
        betrieb,
        themen,
        berufsschule,
        week_number,
        year
    ):

        self.connection.execute(
        """
            INSERT INTO entries (
            date,
            betrieb,
            themen,
            berufsschule,
            week_number,
            year
        )
        VALUES (?, ?, ?, ?, ?, ?)

        ON CONFLICT(date)
        DO UPDATE SET
            betrieb = excluded.betrieb,
            themen = excluded.themen,
            berufsschule = excluded.berufsschule,
            week_number = excluded.week_number,
            year = excluded.year;
        """,
        (
            date,
            betrieb,
            themen,
            berufsschule,
            week_number,
            year
        )
    )

        self.connection.commit()



    def get_week_entries(self, week_number, year):
        cursor = self.connection.execute(
            """
            SELECT *
            FROM entries
            WHERE week_number = ?
            AND year = ?
            ORDER BY date
            """,
            (
                week_number,
                year
            )
        )

        rows = cursor.fetchall()

        return [dict(row) for row in rows]




    def save_report(
            self,
            week_number,
            year,
            taetigkeit,
            themen,
            berufsschule
    ):
        self.connection.execute(
            """
            INSERT INTO reports (
            week_number,
            year,
            taetigkeit,
            themen,
            berufsschule,
            created_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(week_number, year)
            DO UPDATE SET
            taetigkeit = excluded.taetigkeit,
            themen = excluded.themen,
            berufsschule = excluded.berufsschule,
            created_at = excluded.created_at
            """,
            (
                week_number,
                year,
                taetigkeit,
                themen,
                berufsschule,
                datetime.now().isoformat()
            )
        )
        self.connection.commit()


    def get_report(
            self,
            week_number,
            year
    ):
            cursor = self.connection.execute(
            """
            SELECT *
            FROM reports
            WHERE week_number = ?
            AND year = ?
            """,
            (
                week_number,
                year
            )
        )
            row = cursor.fetchone()

            # Checkt ob es einen Bericht gibt und holt diesen
            if row:
                return dict(row)

            # Falls nicht gibt die Funktion nichts zurück
            return None




    def get_entry_by_date(
        self,
        date
    ):
        cursor = self.connection.execute(
            """
            SELECT *
            FROM entries
            WHERE date = ?
            """,
            (date,)
    )

        row = cursor.fetchone()

        if row:
            return dict(row)

        return None



    def delete_entry(
            self,
            date
    ):
        cursor = self.connection.execute(
            """
            DELETE FROM entries
            WHERE date = ?
            """,
            (date,)
        )

        self.connection.commit()
        return cursor.rowcount > 0
        

