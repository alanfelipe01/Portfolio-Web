(() => {
    const size = 9, mineTotal = 10;
    const board = document.getElementById('mines-board');
    const count = document.getElementById('mines-count');
    const time = document.getElementById('mines-time');
    const status = document.getElementById('mines-status');
    const bestLabel = document.getElementById('mines-best');
    const reset = document.getElementById('mines-reset');
    const flagButton = document.getElementById('mines-flag-mode');
    const colors = ['', '#0000cc', '#008000', '#f00000', '#000080', '#800000', '#008080', '#000', '#808080'];
    let cells, started, ended, flags, seconds, timer, flagMode;
    const display = n => String(Math.max(0, Math.min(999, n))).padStart(3, '0');
    function best() {
        try {
            const saved = localStorage.getItem('alan-portfolio:mines-best');
            return saved === null ? 24 : Math.min(24, Number(saved));
        } catch { return 24; }
    }
    function showBest() { const value = best(); bestLabel.textContent = `Melhor: ${value === null ? '--' : value + 's'}`; }
    function neighbors(index) {
        const row = Math.floor(index / size), col = index % size, result = [];
        for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) {
            if ((!x && !y) || row + y < 0 || row + y >= size || col + x < 0 || col + x >= size) continue;
            result.push((row + y) * size + col + x);
        }
        return result;
    }
    function renderCell(index) {
        const cell = cells[index], button = cell.button;
        button.classList.toggle('revealed', cell.revealed);
        button.classList.toggle('exploded', !!cell.exploded);
        button.textContent = cell.revealed ? (cell.mine ? '💣' : cell.adjacent || '') : (cell.flagged ? '🚩' : '');
        button.style.color = colors[cell.adjacent] || '';
        const description = cell.revealed ? (cell.mine ? 'mina' : cell.adjacent ? `${cell.adjacent} minas próximas` : 'vazio') : (cell.flagged ? 'com bandeira' : 'fechado');
        button.setAttribute('aria-label', `Linha ${Math.floor(index / size) + 1}, coluna ${index % size + 1}: ${description}`);
    }
    function start(first) {
        const candidates = cells.map((_, i) => i).filter(i => i !== first);
        for (let i = candidates.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [candidates[i], candidates[j]] = [candidates[j], candidates[i]]; }
        candidates.slice(0, mineTotal).forEach(i => { cells[i].mine = true; });
        cells.forEach((cell, i) => { cell.adjacent = neighbors(i).filter(n => cells[n].mine).length; });
        started = true;
        timer = setInterval(() => { seconds++; time.textContent = display(seconds); }, 1000);
    }
    function finish(won) {
        ended = true; clearInterval(timer);
        reset.textContent = won ? 'B)' : ':(';
        status.textContent = won ? 'Você venceu!' : 'Fim de jogo!';
        if (won) {
            try { const previous = best(); if (previous === null || seconds < Number(previous)) localStorage.setItem('alan-portfolio:mines-best', String(seconds)); } catch {}
            showBest();
        } else cells.forEach((cell, i) => { if (cell.mine) { cell.revealed = true; renderCell(i); } });
    }
    function reveal(index) {
        const cell = cells[index];
        if (ended || cell.revealed || cell.flagged) return;
        if (!started) start(index);
        if (cell.mine) { cell.exploded = true; finish(false); return; }
        const pending = [index];
        while (pending.length) {
            const i = pending.pop(), current = cells[i];
            if (current.revealed || current.flagged || current.mine) continue;
            current.revealed = true; renderCell(i);
            if (!current.adjacent) pending.push(...neighbors(i).filter(n => !cells[n].revealed));
        }
        if (cells.filter(c => c.revealed).length === size * size - mineTotal) finish(true);
    }
    function flag(index) {
        const cell = cells[index];
        if (ended || cell.revealed || (!cell.flagged && flags === mineTotal)) return;
        cell.flagged = !cell.flagged; flags += cell.flagged ? 1 : -1;
        count.textContent = display(mineTotal - flags); renderCell(index);
    }
    function newGame() {
        clearInterval(timer); started = false; ended = false; flags = 0; seconds = 0; flagMode = false;
        count.textContent = display(mineTotal); time.textContent = '000'; status.textContent = 'Boa sorte!'; reset.textContent = ':)';
        flagButton.textContent = 'Bandeira: off'; flagButton.setAttribute('aria-pressed', 'false');
        board.replaceChildren();
        cells = Array.from({length: size * size}, (_, i) => {
            const button = document.createElement('button'); button.type = 'button'; button.className = 'mines-cell';
            button.addEventListener('click', () => flagMode ? flag(i) : reveal(i));
            button.addEventListener('contextmenu', event => { event.preventDefault(); flag(i); });
            button.addEventListener('keydown', event => { if (event.key.toLowerCase() === 'f') { event.preventDefault(); flag(i); } });
            board.appendChild(button); return {button, mine: false, revealed: false, flagged: false, adjacent: 0};
        });
        cells.forEach((_, i) => renderCell(i)); showBest();
    }
    reset.addEventListener('click', newGame);
    flagButton.addEventListener('click', () => { flagMode = !flagMode; flagButton.setAttribute('aria-pressed', String(flagMode)); flagButton.textContent = `Bandeira: ${flagMode ? 'on' : 'off'}`; });
    newGame();
})();

