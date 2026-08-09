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
