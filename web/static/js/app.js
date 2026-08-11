// ==========================================
// STATUS-LABEL PRO WOCHENTAGS-KARTE
// (jede Tages-Karte hat ein eigenes Status-Label, das
// im Ruhezustand ein kleiner pastellgrüner Kreis ist.
// Fokussiert man eines der drei Textfelder, morpht es
// zur Pille mit dem Feldnamen und dessen Farbe. Sobald
// kein Feld der Karte mehr fokussiert ist -> zurück zum
// Kreis)
// ==========================================

const BOUNCE_PEAK_DELAY = 125;

const fieldStates = {
    betrieb: { text: "Betrieb", color: "var(--type-betrieb)" },
    themen: { text: "Themen der Woche", color: "var(--accent-primary)" },
    berufsschule: { text: "Berufsschule", color: "var(--type-berufsschule)" },
};

document.querySelectorAll(".day-entry-card").forEach(function (card) {
    const statusEl = card.querySelector(".status-badge");
    const textareas = card.querySelectorAll(".day-textarea");

    if (!statusEl || textareas.length === 0) {
        return;
    }

    let currentField = null;

    function updateBadge(field) {
        // Kein erneutes Springen, wenn sich am Feld nichts geändert hat.
        if (field === currentField) {
            return;
        }

        currentField = field;

        statusEl.classList.remove("bounce");
        void statusEl.offsetWidth;
        statusEl.classList.add("bounce");

        window.setTimeout(function () {
            if (field) {
                const { text, color } = fieldStates[field];
                statusEl.textContent = text;
                statusEl.style.backgroundColor = color;
                statusEl.classList.add("filled");
            } else {
                statusEl.textContent = "";
                statusEl.style.backgroundColor = "";
                statusEl.classList.remove("filled");
            }
        }, BOUNCE_PEAK_DELAY);
    }

    statusEl.addEventListener("animationend", function () {
        statusEl.classList.remove("bounce");
    });

    textareas.forEach(function (textarea) {
        const field = textarea.dataset.field;

        textarea.addEventListener("focus", function () {
            updateBadge(field);
        });

        textarea.addEventListener("blur", function () {
            saveDayEntry(card);

            // Kurz warten, damit bei einem Wechsel zu einem anderen Feld
            // derselben Karte (z. B. per Tab) nicht kurz der Kreis
            // aufblitzt, bevor das neue Feld fokussiert wird.
            window.setTimeout(function () {
                const stillFocused = Array.from(textareas).some(function (t) {
                    return t === document.activeElement;
                });

                if (!stillFocused) {
                    updateBadge(null);
                }
            }, 0);
        });
    });
});

// ==========================================
// KLICK-ANIMATION FÜR "PUSHABLE"-BUTTONS
// (die normale :active-Transition reicht bei einem
// langen Klick völlig aus. Nur bei einem sehr kurzen
// Klick - kürzer als PRESS_ANIMATION_THRESHOLD - wird
// :active nie sichtbar gerendert, deshalb springt dann
// zusätzlich eine feste Press-Animation ein. So gibt es
// nie zwei Animationen gleichzeitig, die sich in die
// Quere kommen)
// ==========================================

const PRESS_ANIMATION_THRESHOLD = 100;

document.querySelectorAll(".pushable").forEach(function (button) {
    const front = button.querySelector(".front");

    if (!front) {
        return;
    }

    let pressStartedAt = null;

    button.addEventListener("mousedown", function () {
        pressStartedAt = performance.now();
    });

    button.addEventListener("click", function () {
        const pressDuration = pressStartedAt === null
            ? Infinity
            : performance.now() - pressStartedAt;

        pressStartedAt = null;

        if (pressDuration >= PRESS_ANIMATION_THRESHOLD) {
            return;
        }

        front.classList.remove("pressed");
        void front.offsetWidth;
        front.classList.add("pressed");
    });

    front.addEventListener("animationend", function () {
        front.classList.remove("pressed");
    });
});


function saveDayEntry(card) {
    const date = card.dataset.date;
    const betrieb = card.querySelector(".day-textarea[data-field='betrieb']").value;
    const themen = card.querySelector(".day-textarea[data-field='themen']").value;
    const berufsschule = card.querySelector(".day-textarea[data-field='berufsschule']").value;

    fetch("/entry/save", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ date, betrieb, themen, berufsschule }),
    })
        .then(function (response) {
            if (!response.ok) {
                alert("Speichern fehlgeschlagen - dein Eintrag wurde NICHT gespeichert. Bitte Seite neu laden und nochmal versuchen.");
            }
        })
        .catch(function () {
            alert("Speichern fehlgeschlagen (keine Verbindung zum Server) - dein Eintrag wurde NICHT gespeichert.");
        });
}

function generateReport(button) {
    const year = button.dataset.year;
    const week = button.dataset.week;

    const label = button.querySelector(".front");
    const originalText = label.textContent;
    
    button.disabled = true;
    label.textContent = "Ollama denkt nach...";

    fetch(`/report/generate/${year}/${week}`, {
        method: "POST",
    })

    
    .then(function (response) {
        return response.json();
    })


    .then(function (data) {
        if (data.status === "ok") {
            window.location.href = "/bericht";
        } else {
            alert(data.message);
            button.disabled = false;
            label.textContent = originalText;
        }
    })

    .catch(function () {
        alert("Fehler beim Generieren des Berichts. Bitte versuche es erneut.");
        button.disabled = false;
        label.textContent = originalText;
    });
}

// ==========================================
// EIGENER MAUSZEIGER (GLAS-KREIS)
// (bewegt sich rein über CSS "transform", damit der
// Browser das über die GPU erledigen kann statt bei
// jeder Mausbewegung ein Layout-Reflow auszulösen.
// requestAnimationFrame sorgt dafür, dass wir höchstens
// einmal pro gerendertem Frame aktualisieren, auch wenn
// "mousemove" öfter feuert. Nur auf Geräten mit echter
// Maus aktiv - auf Touch-Geräten macht ein Cursor eh
// keinen Sinn und wir sparen uns die Arbeit komplett)
// ==========================================

const CURSOR_HOVER_SELECTOR = "textarea, button, a, input, select, .day-card, .pushable";

if (window.matchMedia("(pointer: fine)").matches) {
    // Hülle: nur Position (per transform, kein transition -> hinkt nicht nach)
    const cursor = document.createElement("div");
    cursor.className = "custom-cursor";

    // Punkt: Größe/Press-Animation, komplett unabhängig von der Position
    const dot = document.createElement("div");
    dot.className = "custom-cursor-dot";
    cursor.appendChild(dot);

    document.body.appendChild(cursor);
    document.documentElement.classList.add("custom-cursor-enabled");

    let targetX = 0;
    let targetY = 0;
    let frameQueued = false;

    document.addEventListener("mousemove", function (e) {
        targetX = e.clientX;
        targetY = e.clientY;
        dot.classList.add("visible");

        if (!frameQueued) {
            frameQueued = true;
            window.requestAnimationFrame(function () {
                cursor.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
                frameQueued = false;
            });
        }
    });

    document.addEventListener("mouseleave", function () {
        dot.classList.remove("visible");
    });

    // Wachsen über Textfeldern/Buttons/Karten
    document.querySelectorAll(CURSOR_HOVER_SELECTOR).forEach(function (el) {
        el.addEventListener("mouseenter", function () {
            dot.classList.add("hovering");
        });

        el.addEventListener("mouseleave", function () {
            dot.classList.remove("hovering");
        });
    });

    // Press-Effekt bleibt genau so lange aktiv, wie die Maustaste gedrückt ist
    document.addEventListener("mousedown", function () {
        dot.classList.add("pressed");
    });

    document.addEventListener("mouseup", function () {
        dot.classList.remove("pressed");
    });
}

function saveRules(button) {
    const regelwerk = document.getElementById("rules-textarea").value;
    const status = document.getElementById("rules-status");
    const label = button.querySelector(".front");
    const originalText = label.textContent;

    button.disabled = true;
    label.textContent = "Speichere...";

    fetch("/ollama-regelwerk/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regelwerk }),
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.status === "ok") {
                status.textContent = "Gespeichert";
                status.classList.add("complete");

                window.setTimeout(function () {
                    status.textContent = "";
                    status.classList.remove("complete");
                }, 2000);
            } else {
                alert(data.error || "Fehler beim Speichern.");
            }
        })
        .catch(function () {
            alert("Fehler beim Speichern des Regelwerks. Bitte versuche es erneut.");
        })
        .finally(function () {
            button.disabled = false;
            label.textContent = originalText;
        });
}

function copyToClipboard(elementId, button) {
    const textarea = document.getElementById(elementId);
    const label = button.querySelector(".front");
    const originalText = label.textContent;

    navigator.clipboard.writeText(textarea.value).then(function () {
        label.textContent = "✓ Kopiert!";

        window.setTimeout(function () {
            label.textContent = originalText;
        }, 1500);
    });
}