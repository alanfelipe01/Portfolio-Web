/* Conversa guiada com respostas e projetos do próprio portfólio. */
(() => {
    const panel = document.getElementById("glitch-options");
    const messages = document.getElementById("glitch-messages");
    const choices = document.getElementById("glitch-choices");
    const back = document.getElementById("glitch-back");
    const restart = document.getElementById("glitch-restart");
    const end = document.getElementById("glitch-end");
    const projects = portfolioArchive.projects;
    const initialMessage = "Miau! Eu sou o Glitch. O que você quer descobrir hoje?";
    let state = "inicio";
    let transcript = [];
    let history = [];

    const states = {
        inicio: {
            options: [
                { label: "Quem é o Alan?", next: "sobre" },
                { label: "Quero conhecer os projetos", next: "projetos" },
                { label: "Como posso entrar em contato?", next: "contato" },
                { label: "Que tal jogarmos alguma coisa?", next: "jogo" }
            ]
        },
        sobre: {
            text: "O Alan estuda Análise e Desenvolvimento de Sistemas na UNINASSAU, curte transformar ideias em soluções e se interessa por desenvolvimento back-end.",
            options: [{ label: "Conhecer mais sobre o Alan", window: "sobre-mim" }]
        },
        projetos: {
            text: "Boa escolha! Qual deles chamou sua atenção?",
            options: () => [
                ...projects.map(project => ({ label: project.name, next: "projeto:" + project.slug })),
                { label: "Ver todos os projetos", window: "projetos" }
            ]
        },
        contato: {
            text: "Você pode falar com o Alan pelo LinkedIn ou por email. Se quiser o currículo, é só pedir por um desses canais!",
            options: [
                { label: "LinkedIn (nova aba)", href: "https://www.linkedin.com/in/alan-felipe-621a72406/" },
                { label: "Enviar email (nova aba)", href: "https://mail.google.com/mail/?view=cm&fs=1&to=alanfelipe1006%40gmail.com" }
            ]
        },
        jogo: {
            text: "Miau! Conheço um jogo para testar sua sorte: Campo Minado. Cuidado onde pisa!",
            options: [
                { label: "Vamos jogar!", window: "campo-minado" },
                { label: "Como funciona?", next: "regras" },
                { label: "Melhor voltar", back: true }
            ]
        },
        regras: {
            text: "Abra todas as casas sem minas para vencer. Os números mostram quantas minas estão nas casas vizinhas. Marque suspeitas com o botão direito, a tecla F ou o modo Bandeira no celular.",
            options: [{ label: "Vamos jogar!", window: "campo-minado" }, { label: "Voltar ao jogo", back: true }]
        }
    };

    function current() {
        if (!state.startsWith("projeto:")) return states[state];
        const project = projects.find(item => item.slug === state.slice("projeto:".length));
        if (!project) return states.inicio;
        return {
            text: [project.summary, project.distinction].filter(Boolean).join(" "),
            options: [
                { label: "Abrir página do projeto", project: project.slug },
                { label: "Conhecer outro projeto", next: "projetos" }
            ]
        };
    }

    function message(text, fromUser) {
        const row = document.createElement("div");
        row.className = "glitch-message " + (fromUser ? "is-user" : "is-glitch");
        if (!fromUser) {
            const avatar = document.createElement("img");
            avatar.src = "assets/glitch/glitch-base.webp";
            avatar.alt = "";
            avatar.className = "glitch-message-avatar";
            row.append(avatar);
        }
        const bubble = document.createElement("p");
        bubble.className = "glitch-message-bubble";
        const sender = document.createElement("span");
        sender.className = "glitch-visually-hidden";
        sender.textContent = fromUser ? "Você: " : "Glitch: ";
        bubble.append(sender, document.createTextNode(text));
        row.append(bubble);
        return row;
    }

    function render(focusChoice = false) {
        messages.replaceChildren(...transcript.map(item => message(item.text, item.fromUser)));
        const options = typeof current().options === "function" ? current().options() : current().options;
        choices.replaceChildren();
        for (const option of options) {
            const control = document.createElement(option.href ? "a" : "button");
            control.textContent = option.label;
            if (option.href) {
                control.href = option.href;
                control.target = "_blank";
                control.rel = "noopener noreferrer";
            } else {
                control.type = "button";
                control.addEventListener("click", () => select(option));
            }
            choices.append(control);
        }
        back.disabled = history.length === 0;
        messages.scrollTop = messages.scrollHeight;
        if (focusChoice) choices.querySelector("button, a")?.focus({ preventScroll: true });
    }

    function select(option) {
        if (option.back) return goBack();
        if (option.window) {
            openWindow(option.window);
            document.getElementById(option.window).querySelector(".close-btn")?.focus();
            return;
        }
        if (option.project) {
            document.dispatchEvent(new CustomEvent("alan-portfolio:open-project", { detail: option.project }));
            return;
        }
        history.push({ state, transcript: [...transcript] });
        transcript.push({ text: option.label, fromUser: true });
        state = option.next;
        transcript.push({ text: current().text, fromUser: false });
        render(true);
    }

    function goBack() {
        const previous = history.pop();
        if (!previous) return;
        state = previous.state;
        transcript = previous.transcript;
        render(true);
    }

    function reset(focusChoice = false) {
        state = "inicio";
        history = [];
        transcript = [{ text: initialMessage, fromUser: false }];
        render(focusChoice);
    }

    back.addEventListener("click", goBack);
    restart.addEventListener("click", () => reset(true));
    end.addEventListener("click", () => {
        closeWindow(panel);
        document.getElementById("glitch-shortcut").focus();
    });
    panel.addEventListener("desktop:close", () => reset());
    panel.addEventListener("desktop:open", () => choices.querySelector("button, a")?.focus({ preventScroll: true }));
    reset();
})();
