# 🖥️ Alan.dev — Portfólio

Portfólio pessoal de **Alan Felipe**, inspirado na interface clássica do **Windows 95** e desenvolvido com **HTML, CSS e JavaScript**.

O site funciona como uma área de trabalho virtual: ícones abrem janelas com informações sobre mim, meus projetos e atalhos para minhas redes. É um projeto de hobby e aprendizado, criado para praticar desenvolvimento web e acompanhar minha evolução como desenvolvedor.

**[🌐 Acessar o portfólio](https://alan-felipe-portfolio.vercel.app)**

## ✨ Funcionalidades

- **Área de trabalho retrô:** cores, bordas, ícones e barra de tarefas inspirados no Windows 95.
- **Apresentação inicial:** a janela “Sobre mim” abre na primeira visita, com a saudação `print("Hello, World!")`, minha apresentação e atalhos para projetos e contato.
- **Janelas interativas:** abrir, fechar, minimizar, restaurar e trazer uma janela para frente. No desktop, também é possível arrastá-las pela barra de título.
- **Menu Iniciar:** acesso a Sobre mim, Projetos, GitHub e Contato pelo LinkedIn.
- **Pasta de projetos:** cartões com descrição, tecnologias e links para os repositórios.
- **Barra de tarefas:** atalhos das janelas abertas e indicação da janela ativa.
- **Detalhes visuais:** relógio com horário fixo proposital e ícone decorativo de som, sem reprodução de áudio.

A apresentação utiliza `localStorage` para lembrar que já foi exibida naquele navegador. Se o armazenamento estiver indisponível, ela abre a cada carregamento. A janela continua acessível pelo ícone “Sobre mim” e pelo menu Iniciar.

## 📱 Experiência no celular

A interface adapta o visual retrô para telas pequenas e dispositivos com toque:

- Janelas ajustadas à área disponível da tela, com conteúdo rolável.
- Controles maiores para fechar e minimizar.
- Ícones organizados em uma linha.
- Botões dos projetos e da apresentação dispostos em coluna.
- Barra de tarefas com rolagem horizontal para acessar as janelas.
- Ajustes para mudanças de orientação e áreas seguras da tela.

No modo compacto, as janelas ficam em posição fixa para facilitar a leitura e a navegação pelo toque.

## 📁 Projetos apresentados

| Projeto | Descrição | Links |
| --- | --- | --- |
| **Litorânea Ambiental** | Landing page para a empresa júnior de Ciências Ambientais da UFC, com serviços, equipe e contato. | [Código](https://github.com/alanfelipe01/litoranea-ambiental) · [Site](https://litoranea-ambiental-ufc.vercel.app/) |
| **Portfolio-Web** | Este portfólio, com área de trabalho retrô e janelas interativas. | [Código](https://github.com/alanfelipe01/Portfolio-Web) |
| **Python — Estudos e Exercícios** | Estudos de Python e lógica de programação, com exercícios, desafios e mini projetos organizados por tópico. | [Repositório](https://github.com/alanfelipe01/python-estudos) |

## 🛠️ Tecnologias

- **HTML5:** estrutura e conteúdo.
- **CSS3:** aparência retrô, layout responsivo e estados visuais.
- **JavaScript:** gerenciamento das janelas, menu Iniciar e registro da primeira visita.
- **Vercel:** hospedagem.

O projeto utiliza JavaScript puro, sem frameworks ou dependências de instalação.

## 🚀 Como executar localmente

1. Clone o repositório:

   ```bash
   git clone https://github.com/alanfelipe01/Portfolio-Web.git
   cd Portfolio-Web
   ```

2. Abra o arquivo `index.html` no navegador.

Também é possível abrir a pasta no VS Code e utilizar um servidor local, como o Live Server. Não é necessário executar comandos de instalação ou build.

## 🖱️ Como navegar

- Clique ou toque nos ícones para abrir as janelas e acessar as redes sociais.
- Use **_** para minimizar e **×** para fechar uma janela.
- Clique no atalho da barra de tarefas para restaurar ou alternar entre janelas. Clicar no atalho da janela ativa a minimiza.
- No desktop, arraste uma janela pela barra de título para reposicioná-la.
- Abra o menu **Iniciar** para acessar os atalhos. O menu fecha ao escolher uma opção, clicar fora ou pressionar **Esc**.
- No menu Iniciar, utilize **Tab**, as **setas**, **Home** e **End** para navegar pelo teclado.
- No celular, deslize o conteúdo das janelas e a barra de tarefas quando necessário.

Os novos links e controles possuem indicação visual de foco. Os botões de fechar e minimizar têm nomes acessíveis, e os links externos abrem em uma nova aba.

## 📂 Estrutura do projeto

```text
Portfolio-Web/
├── index.html       # Área de trabalho, janelas, projetos e menu
├── css/
│   └── style.css    # Estilo Windows 95 e adaptações para celular
├── js/
│   └── script.js    # Interações e gerenciamento das janelas
└── README.md
```

## 🚧 Status

**Publicado na Vercel e em evolução.**

- [x] Área de trabalho inspirada no Windows 95.
- [x] Sistema de janelas e barra de tarefas.
- [x] Apresentação inicial e seção Sobre mim.
- [x] Menu Iniciar funcional.
- [x] Projetos com descrições, tecnologias e links.
- [x] Atalhos para GitHub e LinkedIn.
- [x] Adaptação para celular e navegação por toque.
- [x] Publicação na web.

O portfólio continuará recebendo melhorias conforme meus estudos e projetos avançarem.

## 👨‍💻 Autor

**Alan Felipe**

Estudante de Análise e Desenvolvimento de Sistemas, aprendendo desenvolvimento web e direcionando meus estudos para back-end com Python.

- [GitHub](https://github.com/alanfelipe01)
- [LinkedIn](https://www.linkedin.com/in/alan-felipe-621a72406/)

## 💡 Inspiração e créditos

A ideia surgiu após conhecer um portfólio com uma proposta semelhante em uma publicação no Reddit. A partir dessa referência, desenvolvi minha própria versão como exercício de aprendizado, adicionando minhas ideias e funcionalidades.

[Publicação original: portfólio inspirado no Windows 95](https://www.reddit.com/r/webdev/comments/r8qia3/i_modelled_my_portfolio_website_after_windows_95/)
