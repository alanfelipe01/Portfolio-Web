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

