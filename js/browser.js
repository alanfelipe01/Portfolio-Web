(() => {
    const app = document.getElementById("navegador");
    const page = document.getElementById("browser-page");
    const address = document.getElementById("browser-address");
    const back = document.getElementById("browser-back");
    const forward = document.getElementById("browser-forward");
    const { projects, certifications, events } = portfolioArchive;
    const sections = [
        { path: "projetos", title: "Projetos", icon: "projetos", subtitle: "Aplicações e estudos" },
        { path: "certificacoes", title: "Certificações", icon: "curriculo", subtitle: "Cursos e certificados" },
        { path: "eventos", title: "Eventos e fotos", icon: "eventos", subtitle: "Hackathons, experiências e registros" }
    ];
    const history = [""];
    let position = 0;

    function element(tag, text, className) {
        const node = document.createElement(tag);
        if (text) node.textContent = text;
        if (className) node.className = className;
        return node;
    }

    function icon(src, size) {
        const node = element("img");
        node.src = src;
        node.alt = "";
        node.width = node.height = size;
        return node;
    }

    function routeButton(path, label, className) {
        const node = element("button", label, className);
        node.type = "button";
        node.dataset.route = path;
        return node;
    }

    function externalLink(label, href) {
        const node = element("a", label + " ↗");
        node.href = href;
        node.target = "_blank";
        node.rel = "noopener noreferrer";
        node.setAttribute("aria-label", label + " (nova aba)");
        return node;
    }

    function list(items, className) {
        const node = element("ul", "", className);
        for (const item of items) node.append(element("li", item));
        return node;
    }

    function gallery(images) {
        const grid = element("div", "", "archive-gallery");
        for (const { src, alt, caption } of images) {
            const figure = element("figure");
            const img = element("img");
            img.src = src;
            img.alt = alt;
            img.loading = "lazy";
            figure.append(img);
            if (caption) figure.append(element("figcaption", caption));
            grid.append(figure);
        }
        return grid;
    }

    function note(text) {
        return element("p", text, "archive-note");
    }

    function heading(title, src, home = false) {
        const header = element("header", "", home ? "archive-cover" : "archive-heading");
        const h2 = element("h2", title);
        h2.tabIndex = -1;
        header.append(icon(src, home ? 88 : 40), h2);
        return header;
    }

    function entryButton(path, title, subtitle, src) {
        const button = routeButton(path, "", "archive-entry");
        const copy = element("span");
        copy.append(element("strong", title), element("small", subtitle));
        button.append(icon(src, 38), copy);
        return button;
    }

    function renderHome() {
        const cover = heading("O que vamos descobrir hoje?", "assets/icons/navegador-desktop.svg", true);
        cover.append(element("p", "Escolha um caminho e comece a explorar."));
        const form = element("form", "", "archive-search");
        form.setAttribute("role", "search");
        const input = element("input");
        input.type = "search";
        input.name = "query";
        input.placeholder = "Pesquisar no portfólio";
        input.setAttribute("aria-label", "Pesquisar no portfólio");
        const submit = element("button", "Pesquisar");
        submit.type = "submit";
        form.append(input, submit);
        const grid = element("nav", "", "archive-directory archive-home-directory");
        grid.setAttribute("aria-label", "Seções do arquivo");
        for (const item of sections) {
            grid.append(entryButton(item.path, item.title, item.subtitle, "assets/icons/" + item.icon + ".svg"));
        }
        page.append(cover, form, grid);
    }

    function renderSearch(query) {
        page.append(heading("Resultados da pesquisa", "assets/icons/navegador-desktop.svg"));
        page.append(element("p", "Pesquisa por: " + query));
        const normalize = value => value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const term = normalize(query);
        const matches = value => normalize(value || "").includes(term);
        const results = element("div", "", "archive-directory");
        for (const project of projects) {
            const text = [project.name, project.summary, project.description, project.distinction, ...(project.highlights || []).flatMap(item => [item.label, item.text]), ...(project.features || []), ...(project.technologies || [])].join(" ");
            if (matches(text)) results.append(entryButton("projetos/" + project.slug, project.name, project.summary, project.icon));
        }
        for (const section of sections) {
            const records = section.path === "certificacoes" ? certifications : section.path === "eventos" ? events : [];
            const found = records.some(record => matches([record.name, record.institution, record.date, record.description, record.caption, record.alt].filter(Boolean).join(" ")));
            if (matches(section.title + " " + section.subtitle) || found) {
                results.append(entryButton(section.path, section.title, section.subtitle, "assets/icons/" + section.icon + ".svg"));
            }
        }
        page.append(results.childElementCount ? results : note("Nenhum resultado encontrado. Tente outro termo."));
    }

    function renderProject(project) {
        page.append(heading(project.name, project.icon));
        if (project.highlights?.length) {
            if (project.links?.length) {
                const links = element("div", "", "project-actions project-quick-actions");
                for (const { label, href } of project.links) links.append(externalLink(label, href));
                page.append(links);
            }
            const overview = element("section", "", "project-overview");
            overview.setAttribute("aria-label", "Resumo do projeto");
            const highlights = element("dl", "", "project-highlights");
            for (const { label, text } of project.highlights) {
                const item = element("div");
                item.append(element("dt", label), element("dd", text));
                highlights.append(item);
            }
            overview.append(highlights);
            if (project.images?.length) overview.append(gallery([project.images[0]]));
            page.append(overview);
            if (project.description) page.append(element("h3", "Sobre o projeto"), element("p", project.description));
        } else {
            page.append(element("p", project.description || project.summary));
            if (project.distinction) page.append(element("p", project.distinction, "archive-distinction"));
        }
        page.append(element("h3", "Funcionalidades"), project.features?.length
            ? list(project.features) : note("Funcionalidades a documentar."));
        page.append(element("h3", "Tecnologias"), project.technologies?.length
            ? list(project.technologies, "project-technologies") : note("Tecnologias a informar."));
        const remainingImages = project.highlights?.length ? project.images?.slice(1) : project.images;
        if (remainingImages?.length || !project.highlights?.length) {
            page.append(element("h3", "Imagens"), remainingImages?.length
                ? gallery(remainingImages) : note("Capturas do projeto a adicionar."));
        }
        if (project.links?.length && !project.highlights?.length) {
            const links = element("div", "", "project-actions");
            for (const { label, href } of project.links) links.append(externalLink(label, href));
            page.append(element("h3", "Links externos"), links);
        }
    }

    function renderProjects() {
        const grid = element("div", "", "archive-directory");
        for (const project of projects) {
            grid.append(entryButton("projetos/" + project.slug, project.name, project.summary, project.icon));
        }
        page.append(projects.length ? grid : note("Nenhum projeto publicado ainda."));
    }

    function renderCertifications() {
        if (!certifications.length) page.append(note("Nenhum curso ou certificado publicado ainda."));
        for (const cert of certifications) {
            const card = element("article", "", "archive-record");
            card.append(element("h3", cert.name), element("p", [cert.institution, cert.date].filter(Boolean).join(" · ")));
            if (cert.image) card.append(gallery([cert.image]));
            if (cert.href) card.append(externalLink("Abrir certificado", cert.href));
            page.append(card);
        }
    }

    function renderEvents() {
        if (!events.length) page.append(note("Nenhum evento publicado ainda."));
        for (const event of events) {
            const card = element("article", "", "archive-record");
            card.append(element("h3", event.name), element("p", event.description));
            if (event.images?.length) {
                const eventGallery = gallery(event.images);
                eventGallery.classList.add("event-gallery");
                card.append(eventGallery);
            }
            const project = projects.find(item => item.slug === event.project);
            if (project) card.append(routeButton("projetos/" + project.slug, "Conhecer " + project.name, "archive-link"));
            page.append(card);
        }
    }

    function render(focus = true) {
        const path = history[position];
        page.replaceChildren();
        const section = sections.find(item => item.path === path);
        const siteHeader = element("header", "", "archive-site-header");
        const brand = element("div", "", "archive-brand");
        brand.append(element("strong", "Alan.exe_"), element("span", "PORTFÓLIO PESSOAL"));
        const siteNav = element("nav", "", "archive-site-nav");
        siteNav.setAttribute("aria-label", "Navegação do portfólio");
        siteNav.append(routeButton("", "Início"), routeButton("projetos", "Projetos"));
        siteHeader.append(brand, siteNav);
        page.append(siteHeader);
        if (!path) {
            renderHome();
        } else if (path.startsWith("pesquisa?q=")) {
            renderSearch(decodeURIComponent(path.slice("pesquisa?q=".length)));
        } else if (section) {
            page.append(heading(section.title, "assets/icons/" + section.icon + ".svg"));
            switch (path) {
                case "projetos": renderProjects(); break;
                case "certificacoes": renderCertifications(); break;
                case "eventos": renderEvents(); break;
            }
        } else {
            const breadcrumb = element("nav", "", "archive-breadcrumb");
            breadcrumb.setAttribute("aria-label", "Localização");
            breadcrumb.append(routeButton("", "Início"), document.createTextNode("  ›  "), routeButton("projetos", "Projetos"));
            page.append(breadcrumb);
            renderProject(projects.find(item => "projetos/" + item.slug === path));
        }
        address.value = "alan.exe/" + path;
        back.disabled = position === 0;
        forward.disabled = position === history.length - 1;
        page.scrollTop = 0;
        if (focus) page.querySelector("h2").focus({ preventScroll: true });
    }

    function navigate(path) {
        if (path === history[position]) return;
        history.splice(position + 1, history.length, path);
        position++;
        render();
    }

    document.addEventListener("alan-portfolio:open-project", event => {
        const project = projects.find(item => item.slug === event.detail);
        if (!project) return;
        openWindow("navegador");
        navigate("projetos/" + project.slug);
    });

    // A pasta original e as fichas detalhadas consultam o mesmo catálogo.
    const folder = document.querySelector("#projetos .project-list");
    for (const project of projects) {
        const card = element("article", "", "project-card");
        const header = element("header", "", "project-heading");
        const title = element("h3", project.name);
        title.id = "project-" + project.slug;
        card.setAttribute("aria-labelledby", title.id);
        const img = icon(project.icon, 40);
        img.className = "project-icon";
        header.append(img, title);
        card.append(header);
        if (project.distinction) {
            const award = element("p");
            award.append(element("strong", project.distinction));
            card.append(award);
        }
        card.append(element("p", project.summary));
        if (project.technologies?.length) {
            const tech = list(project.technologies, "project-technologies");
            tech.setAttribute("aria-label", "Tecnologias de " + project.name);
            card.append(tech);
        }
        const actions = element("div", "", "project-actions");
        const details = routeButton("projetos/" + project.slug, "Abrir página do projeto");
        details.setAttribute("aria-label", "Abrir página do projeto " + project.name + " no Navegador");
        actions.append(details);
        for (const { label, href } of project.links || []) {
            const link = externalLink(label, href);
            link.setAttribute("aria-label", label + " de " + project.name + " (nova aba)");
            actions.append(link);
        }
        card.append(actions);
        folder.append(card);
    }
    document.querySelector(".projects-footer").textContent = projects.length + " projetos e estudos · Links externos abrem em uma nova aba.";

    let launcher;
    folder.addEventListener("click", event => {
        const button = event.target.closest("[data-route]");
        if (!button) return;
        openWindow(app.id);
        launcher = button;
        navigate(button.dataset.route);
    });
    page.addEventListener("submit", event => {
        if (!event.target.matches(".archive-search")) return;
        event.preventDefault();
        const query = event.target.elements.query.value.trim();
        if (query) navigate("pesquisa?q=" + encodeURIComponent(query));
    });
    page.addEventListener("click", event => {
        const button = event.target.closest("[data-route]");
        if (button) navigate(button.dataset.route);
    });
    document.getElementById("browser-reload").addEventListener("click", () => render());
    document.getElementById("browser-home").addEventListener("click", () => navigate(""));
    back.addEventListener("click", () => { position--; render(); });
    forward.addEventListener("click", () => { position++; render(); });

    app.addEventListener("desktop:open", () => {
        launcher = document.querySelector('.desktop-icon[data-window="navegador"]');
        page.querySelector("h2").focus({ preventScroll: true });
    });
    app.addEventListener("desktop:close", () => {
        history.splice(0, history.length, "");
        position = 0;
        render(false);
        launcher?.focus({ preventScroll: true });
    });
    app.querySelector(".minimize-btn").addEventListener("click", () => getTaskbarButton(app.id)?.focus());
    render(false);
})();
