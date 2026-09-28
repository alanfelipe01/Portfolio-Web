// =========================================
// ELEMENTOS
// =========================================

const desktop = document.querySelector(".desktop");
const desktopIcons = document.querySelectorAll(".desktop-icon");
const windows = document.querySelectorAll(".window");
const taskbar = document.getElementById("taskbar-windows");
const clock = document.getElementById("clock");

let highestZIndex = 10;


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
        if (event.target.closest("button")) {
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
        if (!dragging) {
            return;
        }

        let x = event.clientX - offsetX;
        let y = event.clientY - offsetY;

        // Limites: não sai da tela e o título nunca fica embaixo da taskbar
        const maxX = window.innerWidth - windowElement.offsetWidth;
        const maxY = window.innerHeight - 42 - header.offsetHeight;

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

});