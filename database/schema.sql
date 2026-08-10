-- Tageseinträge (Betrieb, Themen der Woche, Berufsschule)
CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    betrieb TEXT,
    themen TEXT,
    berufsschule TEXT,
    week_number INTEGER NOT NULL,
    year INTEGER NOT NULL
);

-- Generierte Berichte
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_number INTEGER NOT NULL,
    year INTEGER NOT NULL,
    taetigkeit TEXT,
    themen TEXT,
    berufsschule TEXT,
    created_at TEXT NOT NULL,

    UNIQUE (week_number, year)
);

-- Gespeichertes Regelwerk
CREATE TABLE IF NOT EXISTS einstellungen (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    regelwerk TEXT NOT NULL
);

-- Startzeile anlegen, falls noch keine existiert -> get_rules() findet immer eine Zeile
INSERT OR IGNORE INTO einstellungen (id, regelwerk) VALUES (1, '');