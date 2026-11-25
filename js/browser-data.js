/* Conteúdo editorial usado pela pasta Projetos e pelo navegador do desktop. */
const portfolioArchive = {
    projects: [
        {
            slug: "ecotour",
            name: "EcoTour",
            icon: "assets/icons/projeto-ecotour.svg",
            summary: "Guia digital de descarte de resíduos, com orientações sobre materiais e pontos de coleta no campus.",
            distinction: "Projeto vencedor do Hackathon UNINASSAU 2026.",
            description: "O EcoTour nasceu da necessidade de orientar a comunidade acadêmica sobre o descarte correto de resíduos no campus UNINASSAU Aguanambi. Desenvolvido em equipe para o Hackathon UNINASSAU 2026, o projeto começou com uma pesquisa que reuniu 52 respostas e ajudou a compreender as dúvidas sobre descarte. A equipe também realizou um levantamento de campo, registrando e fotografando nove pontos de coleta distribuídos em oito locais da unidade. Os dados coletados, combinados com a consulta a fontes ambientais, deram origem a um guia digital que reúne orientações por material e apresenta os pontos de descarte compatíveis. Fui responsável pela programação do site, desenvolvendo a interface e as funcionalidades de busca, consulta aos materiais e localização dos pontos de descarte.",
            features: [
                "Busca de materiais por nome, categoria ou termos alternativos.",
                "Orientações sobre preparo, cuidados e coletor indicado para cada material.",
                "Consulta aos pontos de descarte com fotos, localização e materiais aceitos.",
                "Filtros de pontos por material e área do campus.",
                "Indicação de destinos compatíveis e aviso quando não há ponto interno confirmado."
            ],
            technologies: ["HTML", "CSS", "JavaScript", "Python"],
            images: [{ src: "assets/images/ecotour-pagina-inicial.png", alt: "Página inicial do EcoTour com busca de materiais e foto dos coletores no campus." }],
            links: [
                { label: "Visitar site", href: "https://ecotour-nassau.vercel.app/" },
                { label: "Ver código", href: "https://github.com/alanfelipe01/EcoTour" }
            ]
        },
        {
            slug: "litoranea",
            name: "Litorânea Ambiental",
            icon: "assets/icons/projeto-litoranea.svg",
            summary: "Landing page para a empresa júnior de Ciências Ambientais da UFC, apresentando serviços, equipe e canais de contato.",
            features: ["Apresentação dos serviços e da equipe.", "Acesso aos canais de contato da empresa júnior."],
            technologies: ["HTML", "CSS", "JavaScript", "TypeScript"],
            links: [
                { label: "Visitar site", href: "https://litoranea-ambiental-ufc.vercel.app/" }
            ]
        },
        {
            slug: "portfolio",
            name: "Portfolio-Web",
            icon: "assets/icons/projeto-portfolio.svg",
            summary: "Este portfólio! Uma área de trabalho inspirada no Windows 95, com janelas interativas, barra de tarefas e menu Iniciar.",
            features: ["Atalhos para aplicativos na área de trabalho.", "Janelas que podem ser arrastadas, minimizadas e maximizadas."],
            technologies: ["HTML", "CSS", "JavaScript"],
            images: [{ src: "assets/images/portfolio-desktop.jpg", alt: "Área de trabalho do portfólio com a janela Sobre mim aberta e o Glitch." }],
            links: [{ label: "Ver código", href: "https://github.com/alanfelipe01/Portfolio-Web" }]
        },
        {
            slug: "python",
            name: "Python — Estudos e Exercícios",
            icon: "assets/icons/projeto-python.svg",
            summary: "Repositório de estudos com exercícios, desafios e mini projetos para praticar Python e lógica de programação, organizados por tópico.",
            features: ["Exercícios, desafios e mini projetos organizados por tópico."],
            technologies: ["Python"],
            links: [{ label: "Ver repositório", href: "https://github.com/alanfelipe01/python-estudos" }]
        }
    ],
    // Exemplo de campos: { name, institution, date, href, image: { src, alt } }
    certifications: [],
    events: [
        {
            name: "Hackathon UNINASSAU 2026",
            description: "Participei do Hackathon UNINASSAU 2026 com o EcoTour, um guia digital de descarte de resíduos desenvolvido em equipe para o campus UNINASSAU Aguanambi. O projeto foi vencedor do hackathon, e fui responsável pela programação do site.",
            images: [
                { src: "assets/images/hackathon-uninassau-equipe.jpeg", alt: "Três integrantes da equipe ao lado de uma tela com o EcoTour." },
                { src: "assets/images/hackathon-uninassau-certificados.jpeg", alt: "Certificados de participação no Hackathon UNINASSAU 2026." }
            ],
            project: "ecotour"
        },
        {
            name: "Siará Tech Summit 2026",
            description: "Participei dos três dias do Siará Tech Summit, promovido pelo Sebrae de 7 a 9 de outubro de 2026. Conhecer diversas startups e acompanhar palestras ampliou minha visão sobre tecnologia e inovação.",
            images: [
                { src: "assets/images/siara-tech-summit-alan.jpeg", alt: "Alan no auditório do Siará Tech Summit." },
                { src: "assets/images/siara-tech-summit-palestra.jpeg", alt: "Palestra no palco do Siará Tech Summit." },
                { src: "assets/images/siara-tech-summit-hackathon.jpeg", alt: "Entrada da área de hackathon do evento." },
                { src: "assets/images/siara-tech-summit-grupo.jpeg", alt: "Grupo de participantes reunido no evento." },
                { src: "assets/images/siara-tech-summit-amigos.jpeg", alt: "Alan e outros participantes em uma selfie no evento." },
                { src: "assets/images/siara-tech-summit-retratos.jpeg", alt: "Três participantes seguram retratos ilustrados no evento." }
            ]
        }
    ],
    photos: [
        { src: "assets/images/alan.jpeg", alt: "Alan Felipe em um evento de tecnologia.", caption: "Registro de um evento de tecnologia" },
        { src: "assets/images/portfolio-desktop.jpg", alt: "Área de trabalho do portfólio com a janela Sobre mim aberta e o Glitch.", caption: "Portfolio-Web · Área de trabalho" }
    ]
};
