// =========================================
// ELEMENTOS
// =========================================

const desktop = document.querySelector(".desktop");
const desktopIcons = document.querySelectorAll(".desktop-icon");
const windows = document.querySelectorAll(".window");
const taskbar = document.getElementById("taskbar-windows");
const clock = document.getElementById("clock");
const startButton = document.querySelector(".start-button");
const startMenu = document.getElementById("start-menu");

let highestZIndex = 10;
const compactLayout = window.matchMedia("(max-width: 700px), (pointer: coarse)");


// =========================================
// FUNÇÕES AUXILIARES
// =========================================

function getTaskbarButton(windowId) {
    return taskbar.querySelector(`[data-taskbar-window="${windowId}"]`);
}


// =========================================
// TRAZER JANELA PARA FRENTE
// =========================================

function bringToFront(windowElement) {
    highestZIndex++;
    windowElement.style.zIndex = highestZIndex;

    // Só a janela da frente fica com o botão "apertado"
    taskbar.querySelectorAll(".taskbar-window").forEach(button => {
        button.classList.remove("active");
    });

    const button = getTaskbarButton(windowElement.id);

    if (button) {
        button.classList.add("active");
        // Mantém o atalho ativo visível quando a barra precisa rolar no celular.
        button.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
}


// =========================================
// ABRIR / FECHAR / MINIMIZAR
// =========================================

function openWindow(windowId) {
    const windowElement = document.getElementById(windowId);

    if (!windowElement) {
        return;
    }

    windowElement.classList.add("open");

    createTaskbarButton(windowElement);
    bringToFront(windowElement);
}

function closeWindow(windowElement) {
    windowElement.classList.remove("open");

    const button = getTaskbarButton(windowElement.id);

    if (button) {
        button.remove();
    }
}

function minimizeWindow(windowElement) {
    windowElement.classList.remove("open");

    // A janela sumiu, então o botão não fica mais "apertado"
    const button = getTaskbarButton(windowElement.id);

    if (button) {
        button.classList.remove("active");
    }
}


// =========================================
// BOTÃO NA BARRA DE TAREFAS
// =========================================

function createTaskbarButton(windowElement) {
    // Se já existe, não cria outro
    if (getTaskbarButton(windowElement.id)) {
        return;
    }

    const button = document.createElement("button");

    button.classList.add("taskbar-window");
    button.dataset.taskbarWindow = windowElement.id;
    button.textContent = windowElement
        .querySelector(".window-title")
        .textContent.trim();

    button.addEventListener("click", () => {
        const isOpen = windowElement.classList.contains("open");
        const isActive = button.classList.contains("active");

        // Comportamento do Windows de verdade:
        // - janela na frente  -> minimiza
        // - janela escondida ou atrás de outra -> traz pra frente
        if (isOpen && isActive) {
            minimizeWindow(windowElement);
        } else {
            windowElement.classList.add("open");
            bringToFront(windowElement);
        }
    });

    taskbar.appendChild(button);
}

// =========================================
// ÍCONES DO DESKTOP (selecionar + abrir)
// =========================================

desktopIcons.forEach(icon => {
    icon.addEventListener("click", () => {
        desktopIcons.forEach(other => other.classList.remove("selected"));
        icon.classList.add("selected");

        if (icon.dataset.window) {
            openWindow(icon.dataset.window);
        } else if (icon.dataset.link) {
            window.open(icon.dataset.link, "_blank", "noopener,noreferrer");
        }
    });
});

// MENU INICIAR
function closeStartMenu(restoreFocus = false) {
    startMenu.hidden = true;
    startButton.setAttribute("aria-expanded", "false");
    if (restoreFocus) startButton.focus();
}

function openStartMenu() {
    startMenu.hidden = false;
    startButton.setAttribute("aria-expanded", "true");
    startMenu.querySelector(".start-menu-item").focus();
}

startButton.addEventListener("click", () => {
    if (startMenu.hidden) openStartMenu();
    else closeStartMenu(true);
});

document.addEventListener("pointerdown", event => {
    if (!startMenu.hidden && !startMenu.contains(event.target) && !startButton.contains(event.target)) {
        closeStartMenu(startMenu.contains(document.activeElement));
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !startMenu.hidden) {
        event.preventDefault();
        closeStartMenu(true);
    }
});

document.addEventListener("focusin", event => {
    if (!startMenu.hidden && !startMenu.contains(event.target) && !startButton.contains(event.target)) {
        closeStartMenu();
    }
});

// Tab funciona normalmente; as setas também percorrem os atalhos.
startMenu.addEventListener("keydown", event => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = [...startMenu.querySelectorAll(".start-menu-item")];
    const index = items.indexOf(document.activeElement);
    let next = event.key === "ArrowDown" ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = items.length - 1;
    event.preventDefault();
    items[next].focus();
});

startMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => closeStartMenu(true));
});

// Os atalhos da apresentação e do menu usam o mesmo sistema de janelas.
document.querySelectorAll("[data-open-window]").forEach(button => {
    button.addEventListener("click", () => {
        const windowId = button.dataset.openWindow;
        closeStartMenu();
        openWindow(windowId);
        // Permite continuar a navegação pelo teclado na janela aberta.
        document.getElementById(windowId)?.querySelector(".close-btn")?.focus();
    });
});

// Clicar no fundo do desktop tira a seleção dos ícones
desktop.addEventListener("click", event => {
    if (
        event.target.classList.contains("desktop") ||
        event.target.classList.contains("taskbar")
    ) {
        desktopIcons.forEach(icon => icon.classList.remove("selected"));
    }
});


// =========================================
// CONFIGURAR CADA JANELA
// (fechar, minimizar, foco e arrastar)
// =========================================

windows.forEach(windowElement => {

    const header = windowElement.querySelector(".window-header");
    const closeButton = windowElement.querySelector(".close-btn");
    const minimizeButton = windowElement.querySelector(".minimize-btn");

    // ----- Botões da janela -----

    closeButton.addEventListener("click", () => closeWindow(windowElement));
    minimizeButton.addEventListener("click", () => minimizeWindow(windowElement));

    // ----- Foco: clicar em qualquer parte traz pra frente -----
    // (o pointerdown do header também "borbulha" até aqui,
    //  então não precisa chamar bringToFront de novo no arrasto)

    windowElement.addEventListener("pointerdown", () => {
        bringToFront(windowElement);
    });

    // ----- Arrastar -----

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    header.addEventListener("pointerdown", event => {
        // Não arrasta ao clicar nos botões
        if (compactLayout.matches || event.button !== 0 || event.target.closest("button")) {
            return;
        }

        dragging = true;

        const rect = windowElement.getBoundingClientRect();

        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        // Sai do posicionamento centralizado e passa a usar left/top
        windowElement.style.transform = "none";
        windowElement.style.left = `${rect.left}px`;
        windowElement.style.top = `${rect.top}px`;

        header.setPointerCapture(event.pointerId);
    });

    header.addEventListener("pointermove", event => {
        if (!dragging || compactLayout.matches) {
            return;
        }

        let x = event.clientX - offsetX;
        let y = event.clientY - offsetY;

        // Limites: não sai da tela e o título nunca fica embaixo da taskbar
        const maxX = desktop.clientWidth - windowElement.offsetWidth;
        const maxY = desktop.clientHeight - document.querySelector(".taskbar").offsetHeight - windowElement.offsetHeight;

        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));

        windowElement.style.left = `${x}px`;
        windowElement.style.top = `${y}px`;
    });

    header.addEventListener("pointerup", () => {
        dragging = false;
    });

    header.addEventListener("pointercancel", () => {
        dragging = false;
    });

    header.addEventListener("lostpointercapture", () => {
        dragging = false;
    });

    compactLayout.addEventListener("change", () => {
        dragging = false;
    });

});

// Recoloca janelas arrastadas na área visível ao redimensionar ou girar a tela.
function keepWindowsVisible() {
    windows.forEach(windowElement => {
        if (compactLayout.matches) {
            windowElement.style.removeProperty("left");
            windowElement.style.removeProperty("top");
            windowElement.style.removeProperty("transform");
            return;
        }
        if (!windowElement.classList.contains("open") || !windowElement.style.left) return;
        const rect = windowElement.getBoundingClientRect();
        const maxX = Math.max(0, desktop.clientWidth - windowElement.offsetWidth);
        const maxY = Math.max(0, desktop.clientHeight - document.querySelector(".taskbar").offsetHeight - windowElement.offsetHeight);
        windowElement.style.left = `${Math.max(0, Math.min(rect.left, maxX))}px`;
        windowElement.style.top = `${Math.max(0, Math.min(rect.top, maxY))}px`;
    });
}

window.addEventListener("resize", keepWindowsVisible);
compactLayout.addEventListener("change", keepWindowsVisible);

// Apresenta o portfólio uma vez por navegador. Sem armazenamento disponível,
// mantém a apresentação acessível abrindo-a normalmente a cada carregamento.
try {
    const welcomeKey = "alan-portfolio:intro-seen";
    if (localStorage.getItem(welcomeKey) !== "true") {
        openWindow("sobre-mim");
        localStorage.setItem(welcomeKey, "true");
    }
} catch {
    openWindow("sobre-mim");
}
