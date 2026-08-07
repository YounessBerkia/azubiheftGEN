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
