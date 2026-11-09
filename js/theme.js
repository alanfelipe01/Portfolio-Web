(() => {
    const storageKey = "alan-portfolio:theme";
    const labels = { padrao: "Padrão", noite: "Noite" };
    let theme = "padrao";

    try {
        const saved = localStorage.getItem(storageKey);
        if (Object.hasOwn(labels, saved)) theme = saved;
    } catch {
        // A personalização continua disponível durante a visita.
    }

    function applyTheme(value, save = false) {
        theme = Object.hasOwn(labels, value) ? value : "padrao";
        document.documentElement.dataset.theme = theme;
        document.querySelectorAll("[data-theme-choice]").forEach(button => {
            button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme));
        });
        const currentTheme = document.getElementById("current-theme");
        if (currentTheme) currentTheme.textContent = labels[theme];
        if (save) {
            try {
                localStorage.setItem(storageKey, theme);
            } catch {
                // Sem armazenamento, a escolha vale apenas para a visita atual.
            }
        }
    }

    applyTheme(theme);
    document.addEventListener("DOMContentLoaded", () => {
        applyTheme(theme);
        document.querySelectorAll("[data-theme-choice]").forEach(button => {
            button.addEventListener("click", () => applyTheme(button.dataset.themeChoice, true));
        });
        document.getElementById("reset-theme").addEventListener("click", () => applyTheme("padrao", true));
    });
})();
