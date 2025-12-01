/* ============================================================
   VARIÁVEIS GLOBAIS
============================================================ */
let puzzle = [];
let solution = [];
let selectedCell = null;
let notesMode = false;
let mistakes = 0;
let startTime = null;
let timerInterval = null;
let finished = false;

/* ============================================================
   FUNÇÃO PRINCIPAL - INICIALIZA
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("new-game").onclick = newGame;
    document.getElementById("play-again").onclick = newGame;
    document.getElementById("restart-modal").onclick = newGame;

    document.getElementById("toggle-dark").onclick = toggleDark;

    document.getElementById("notes-btn").onclick = toggleNotes;
    document.getElementById("notes-btn-m").onclick = toggleNotes;

    document.getElementById("erase-btn").onclick = eraseCell;
    document.getElementById("erase-btn-m").onclick = eraseCell;

    document.getElementById("check-btn").onclick = checkBoard;
    document.getElementById("check-btn-m").onclick = checkBoard;

    document.getElementById("hint-btn").onclick = giveHint;
    document.getElementById("hint-btn-m").onclick = giveHint;

    document.getElementById("continue-ad").onclick = rewardedContinue;

    newGame();
});

/* ============================================================
   NOVO JOGO
============================================================ */
function newGame() {
    closeAllModals();
    mistakes = 0;
    finished = false;
    updateMistakes();

    // Reset timer
    clearInterval(timerInterval);
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);

    const removeCount = parseInt(document.getElementById("difficulty").value);

    solution = generateFullGrid(); 
    puzzle = JSON.parse(JSON.stringify(solution));

    removeNumbers(puzzle, removeCount);

    renderBoard();
    renderNumberPads();
}

/* ============================================================
   GERAÇÃO DO SUDOKU (BACKTRACKING)
============================================================ */
function generateFullGrid() {
    let grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    fillGrid(grid);
    return grid;
}

function fillGrid(g) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (g[r][c] === 0) {
                let nums = shuffle([1,2,3,4,5,6,7,8,9]);
                for (let n of nums) {
                    if (isSafe(g, r, c, n)) {
                        g[r][c] = n;
                        if (fillGrid(g)) return true;
                        g[r][c] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function isSafe(g, r, c, n) {
    for (let i = 0; i < 9; i++) {
        if (g[r][i] === n) return false;
        if (g[i][c] === n) return false;
    }
    let br = Math.floor(r / 3) * 3;
    let bc = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
            if (g[br+i][bc+j] === n) return false;
    return true;
}

function removeNumbers(grid, count) {
    let removed = 0;
    while (removed < count) {
        let r = Math.floor(Math.random() * 9);
        let c = Math.floor(Math.random() * 9);
        if (grid[r][c] !== 0) {
            grid[r][c] = 0;
            removed++;
        }
    }
}

/* ============================================================
   RENDERIZAÇÃO DO TABULEIRO
============================================================ */
function renderBoard() {
    const board = document.getElementById("sudoku-grid");
    board.innerHTML = "";

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.r = r;
            cell.dataset.c = c;

            if (puzzle[r][c] !== 0) {
                cell.textContent = puzzle[r][c];
                cell.classList.add("given");
            } else {
                cell.onclick = () => selectCell(cell);
            }

            board.appendChild(cell);
        }
    }
}

/* ============================================================
   SELEÇÃO DE CÉLULAS E DESTAQUES
============================================================ */
function selectCell(cell) {
    if (finished) return;

    clearHighlights();

    selectedCell = cell;
    cell.classList.add("selected");

    let r = parseInt(cell.dataset.r);
    let c = parseInt(cell.dataset.c);

    highlightRelated(r, c);
    highlightSameNumbers(cell);
}

function clearHighlights() {
    document.querySelectorAll(".cell").forEach(c => {
        c.classList.remove("selected", "related", "same");
    });
}

function highlightRelated(r, c) {
    document.querySelectorAll(".cell").forEach(cell => {
        let rr = parseInt(cell.dataset.r);
        let cc = parseInt(cell.dataset.c);
        if (rr === r || cc === c ||
            (Math.floor(rr/3) === Math.floor(r/3) && Math.floor(cc/3) === Math.floor(c/3))) {
            cell.classList.add("related");
        }
    });
}

function highlightSameNumbers(cell) {
    const val = cell.textContent;
    if (!val) return;

    document.querySelectorAll(".cell").forEach(c => {
        if (c.textContent === val) c.classList.add("same");
    });
}

/* ============================================================
   NÚMERO PAD (DESKTOP/MOBILE)
============================================================ */
function renderNumberPads() {
    renderPad("number-pad");
    renderPad("number-pad-mobile");
}

function renderPad(id) {
    const pad = document.getElementById(id);
    pad.innerHTML = "";

    for (let i = 1; i <= 9; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.onclick = () => insertNumber(i);
        pad.appendChild(btn);
    }
}

/* ============================================================
   INSERÇÃO DE NÚMEROS
============================================================ */
function insertNumber(num) {
    if (!selectedCell || finished) return;

    let r = parseInt(selectedCell.dataset.r);
    let c = parseInt(selectedCell.dataset.c);

    if (puzzle[r][c] !== 0) return; // célula fixa

    // Modo notas
    if (notesMode) {
        insertNote(selectedCell, num);
        return;
    }

    selectedCell.innerHTML = num;

    if (num == solution[r][c]) {
        selectedCell.classList.add("correct");
        checkFinish();
    } else {
        mistakes++;
        updateMistakes();
        if (mistakes >= 5) showErrorModal();
    }

    highlightSameNumbers(selectedCell);
}

/* ============================================================
   NOTAS (CANDIDATOS)
============================================================ */
function toggleNotes() {
    notesMode = !notesMode;

    document.getElementById("notes-btn").classList.toggle("active", notesMode);
    document.getElementById("notes-btn-m").classList.toggle("active", notesMode);
}

function insertNote(cell, num) {
    if (!cell.classList.contains("notes")) {
        cell.innerHTML = "";
        cell.classList.add("notes");
    }
    if (cell.innerHTML.includes(num)) return;

    cell.innerHTML += `<span>${num}</span>`;
}

/* ============================================================
   APAGAR NÚMERO
============================================================ */
function eraseCell() {
    if (!selectedCell || selectedCell.classList.contains("given")) return;
    selectedCell.innerHTML = "";
}

/* ============================================================
   DICA
============================================================ */
function giveHint() {
    if (!selectedCell) return;

    let r = selectedCell.dataset.r;
    let c = selectedCell.dataset.c;

    selectedCell.innerHTML = solution[r][c];
}

/* ============================================================
   CHECAR TABULEIRO INSTANTÂNEO
============================================================ */
function checkBoard() {
    document.querySelectorAll(".cell").forEach(cell => {
        let r = cell.dataset.r;
        let c = cell.dataset.c;

        if (!cell.classList.contains("given")) {
            if (cell.textContent == solution[r][c]) {
                cell.classList.add("correct");
            } else {
                cell.classList.add("wrong");
            }
        }
    });
}

/* ============================================================
   TIMER
============================================================ */
function updateTimer() {
    if (finished) return;

    let diff = Math.floor((Date.now() - startTime) / 1000);

    let min = String(Math.floor(diff / 60)).padStart(2, "0");
    let sec = String(diff % 60).padStart(2, "0");

    document.getElementById("time").textContent = `${min}:${sec}`;
}

/* ============================================================
   ERROS
============================================================ */
function updateMistakes() {
    document.getElementById("mistakes").textContent = mistakes;
}

function showErrorModal() {
    clearInterval(timerInterval);
    document.getElementById("error-modal").style.display = "flex";
}

function rewardedContinue() {
    // Aqui será adicionado o rewarded ad real
    mistakes = 0;
    updateMistakes();
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    closeAllModals();
}

/* ============================================================
   TERMINAR O JOGO
============================================================ */
function checkFinish() {
    for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++)
            if (document.querySelector(`.cell[data-r='${r}'][data-c='${c}']`).textContent == "")
                return;

    endGame();
}

function endGame() {
    finished = true;
    clearInterval(timerInterval);

    saveScore();
    loadRanking();

    document.getElementById("modal-end").style.display = "flex";
}

/* ============================================================
   RANKING LOCAL
============================================================ */
function saveScore() {
    let time = document.getElementById("time").textContent;
    let points = calculatePoints();

    let record = { time, points, date: new Date().toISOString() };

    let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    ranking.push(record);

    ranking.sort((a,b) => b.points - a.points);
    ranking = ranking.slice(0, 20);

    localStorage.setItem("ranking", JSON.stringify(ranking));
}

function calculatePoints() {
    let timeStr = document.getElementById("time").textContent;
    let [m, s] = timeStr.split(":").map(Number);
    let total = m * 60 + s;

    let base = 10000;
    let deduction = total * 5 + mistakes * 200;

    return Math.max(0, base - deduction);
}

function loadRanking() {
    let ranking = JSON.parse(localStorage.getItem("ranking")) || [];

    const list = document.getElementById("ranking-list");
    list.innerHTML = "";

    ranking.slice(0, 10).forEach((r, i) => {
        let li = document.createElement("li");
        li.innerHTML = `<strong>#${i+1}</strong> – ${r.points} pontos • ${r.time}`;
        list.appendChild(li);
    });
}

/* ============================================================
   UTILIDADES
============================================================ */
function shuffle(a) {
    return a.sort(() => Math.random() - 0.5);
}

function closeAllModals() {
    document.querySelectorAll(".modal").forEach(m => m.style.display = "none");
}

function toggleDark() {
    document.body.classList.toggle("dark");
}
