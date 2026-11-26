# Alan.dev — Portfólio

Um portfólio pessoal que transforma a navegação em uma área de trabalho inspirada no Windows 95. O projeto reúne minha trajetória, habilidades e projetos em uma interface interativa, desenvolvida com HTML, CSS e JavaScript puro.

**[Acessar o portfólio](https://alan-felipe-portfolio.vercel.app)**

![Área de trabalho do portfólio no computador com a janela Sobre mim aberta e o Glitch](assets/images/portfolio-desktop.jpg)

## Explore a área de trabalho

- **Sobre mim:** apresentação, formação e tecnologias que estudo.
- **Projetos:** trabalhos e estudos com suas tecnologias e links para código ou demonstração.
- **Navegador:** arquivo pessoal com histórico interno, fichas de projetos, certificações e uma seção de eventos e fotos.
- **Glitch.exe:** um gato que acompanha a área de trabalho e ajuda a explorar o portfólio por assuntos e atalhos. É possível pausar ou ocultá-lo e escolher se inicia com o site.
- **Campo Minado:** jogo acessível pelo menu Iniciar, com cronômetro e modo de bandeira para telas de toque.
- **Painel de Controle:** alterna entre os temas Padrão, Noite e Órbita 95.
- **Janelas:** podem ser arrastadas, minimizadas, maximizadas, restauradas e fechadas. A barra de tarefas permite alternar entre elas.
- **Atalhos:** acesso ao GitHub, LinkedIn e contato por e-mail.

A interface se adapta a telas menores e à navegação por toque. O currículo pode ser solicitado pelos canais de contato disponíveis na seção Sobre mim.

## Projetos apresentados

| Projeto | Descrição | Links |
| --- | --- | --- |
| **EcoTour** | Guia digital de descarte de resíduos, vencedor do Hackathon UNINASSAU 2026. | [Site](https://ecotour-nassau.vercel.app/) · [Código](https://github.com/alanfelipe01/EcoTour) |
| **Litorânea Ambiental** | Landing page para a empresa júnior de Ciências Ambientais da UFC. | [Site](https://litoranea-ambiental-ufc.vercel.app/) |
| **Portfolio-Web** | Este portfólio, com área de trabalho e janelas interativas. | [Código](https://github.com/alanfelipe01/Portfolio-Web) |
| **Python — Estudos e Exercícios** | Exercícios, desafios e projetos para praticar Python e lógica de programação. | [Repositório](https://github.com/alanfelipe01/python-estudos) |

## Tecnologias

- HTML5, CSS3 e JavaScript
- Vercel para hospedagem

O projeto não utiliza frameworks, instalação de dependências ou etapa de build.

## Executar localmente

```bash
git clone https://github.com/alanfelipe01/Portfolio-Web.git
cd Portfolio-Web
```

Abra o arquivo `index.html` no navegador ou utilize um servidor local, como o Live Server do VS Code.

## Como navegar

Clique ou toque nos ícones da área de trabalho para abrir janelas e acessar links. Arraste uma janela pela barra de título; use os botões no canto superior para minimizar, maximizar ou fechar. Os botões na barra de tarefas permitem alternar entre as janelas.

No menu Iniciar, use **Tab**, as **setas**, **Home** e **End** para navegar e **Esc** para fechar. No Campo Minado, use o botão direito ou a tecla **F** para marcar uma bandeira; em telas de toque, ative o modo de bandeira.

O navegador pode guardar localmente o tema, a preferência de inicialização do Glitch, a apresentação da primeira visita e o melhor tempo do jogo. Se o armazenamento estiver indisponível, algumas preferências podem não persistir. O relógio acompanha a hora do dispositivo, a data exibida é fixa e os ícones de rede e som são decorativos.

## Estrutura do projeto

```text
Portfolio-Web/
├── index.html       # Área de trabalho e janelas
├── css/             # Estilos separados por componente e responsividade
├── js/              # Interações, temas, Glitch e Campo Minado
├── assets/
│   ├── fonts/       # Fonte da interface
│   ├── glitch/      # Imagens do mascote
│   ├── icons/       # Ícones do portfólio e tecnologias
│   └── images/      # Foto e captura do portfólio
└── README.md
```

## Adicionar conteúdo ao navegador

Edite `js/browser-data.js`. As alterações aparecem ao recarregar o portfólio. A pasta Projetos e o navegador compartilham a mesma lista.

- **Projetos** — acrescente um objeto a `projects` com `slug` único (por exemplo, `ecotour`), `name`, `summary` e `icon`. A ficha aceita `description`, `distinction`, listas de `features` e `technologies`, `images` e `links` no formato `{ label, href }`. Cada projeto ganha o endereço interno `alan.exe/projetos/<slug>`.
- **Certificações** — acrescente a `certifications` um objeto com `name`, `institution` e `date` (texto como deve aparecer). Inclua `href` ou `image` quando houver um comprovante.
- **Eventos e fotos** — use `events` com `name`, `description` e, se disponíveis, `images` e o `project` correspondente ao slug de um projeto.
  Adicione os registros da galeria a `photos`. Cada imagem usa `{ src, alt, caption }`, com caminho relativo ao portfólio, descrição acessível e legenda opcional. Esse formato também serve para imagens nas demais seções. Guarde os arquivos em `assets/images/`.

## Sobre mim

Sou Alan Felipe, estudante de Análise e Desenvolvimento de Sistemas na UNINASSAU, com foco em desenvolvimento back-end com Python, Django e SQL. Busco uma oportunidade de estágio na área de TI.

- [GitHub](https://github.com/alanfelipe01)
- [LinkedIn](https://www.linkedin.com/in/alan-felipe-621a72406/)

## Inspiração

A ideia surgiu após conhecer um portfólio com uma proposta semelhante em uma publicação no Reddit. A partir dela, comecei a criar minha própria versão, experimentando ideias e aprendendo durante o processo.

[Publicação que inspirou o projeto](https://www.reddit.com/r/webdev/comments/r8qia3/i_modelled_my_portfolio_website_after_windows_95/)
