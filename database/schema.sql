-- Tageseinträge (Arbeit oder Berufsschule)
CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    entry_type TEXT NOT NULL,
    content TEXT NOT NULL,
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
