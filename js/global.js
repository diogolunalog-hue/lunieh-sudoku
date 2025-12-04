/* ============================================================
   VARIÁVEIS GLOBAIS
============================================================ */
let grid = [];
let solution = [];

let selectedCell = null;
let notesMode = false;
let eliminateMode = false;

let errors = 0;
let hintsLeft = 3;

let timer = 0;
let timerInterval = null;
let isPaused = false;

let history = []; // Para UNDO

/* ============================================================
   INICIALIZAÇÃO
============================================================ */
window.onload = () => {
  document.getElementById("new-game").onclick = newGame;
  document.getElementById("pause").onclick = togglePause;
  document.getElementById("resume-btn").onclick = togglePause;
  document.getElementById("play-again").onclick = newGame;

  document.getElementById("notes-btn").onclick = toggleNotes;
  document.getElementById("undo-btn").onclick = undoAction;
  document.getElementById("hint-btn").onclick = giveHint;
  document.getElementById("eliminate-btn").onclick = toggleEliminate;

  document.getElementById("theme-toggle").onclick = toggleTheme;

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !isPaused) togglePause();
  });

  window.addEventListener("blur", () => {
    if (!isPaused) togglePause();
  });

  newGame();
};

/* ============================================================
   NOVO JOGO
============================================================ */
function newGame() {
  errors = 0;
  timer = 0;
  hintsLeft = 3;
  notesMode = false;
  eliminateMode = false;

  document.getElementById("hints").textContent = hintsLeft;

  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);

  history = [];

  generateSudoku();
  renderGrid();
  renderNumberPad();
  updateInfo();

  document.getElementById("win-modal").style.display = "none";
  document.getElementById("pause-overlay").style.display = "none";
  isPaused = false;
}

/* ============================================================
   TIMER
============================================================ */
function updateTimer() {
  if (isPaused) return;
  timer++;
  updateInfo();
}

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/* ============================================================
   SUDOKU ENGINE (GERAÇÃO DO GRID)
============================================================ */
function generateSudoku() {
  grid = Array(9).fill().map(() => Array(9).fill(0));
  solution = Array(9).fill().map(() => Array(9).fill(0));

  fillGrid(solution);

  const difficulty = parseInt(document.getElementById("difficulty").value);
  const puzzle = JSON.parse(JSON.stringify(solution));

  removeNumbers(puzzle, difficulty);
  grid = puzzle;
}

function fillGrid(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        let nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);

        for (let n of nums) {
          if (isSafe(board, r, c, n)) {
            board[r][c] = n;
            if (fillGrid(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function isSafe(b, r, c, n) {
  for (let i = 0; i < 9; i++) {
    if (b[r][i] === n || b[i][c] === n) return false;
  }

  const br = r - (r % 3);
  const bc = c - (c % 3);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (b[br+i][bc+j] === n) return false;

  return true;
}

function removeNumbers(board, count) {
  let removed = 0;

  while (removed < count) {
    let r = Math.floor(Math.random() * 9);
    let c = Math.floor(Math.random() * 9);

    if (board[r][c] !== 0) {
      board[r][c] = 0;
      removed++;
    }
  }
}

/* ============================================================
   RENDER DO GRID
============================================================ */
function renderGrid() {
  const container = document.getElementById("sudoku-grid");
  container.innerHTML = "";

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.r = r;
      cell.dataset.c = c;

      const span = document.createElement("span");
      cell.appendChild(span);

      if (grid[r][c] !== 0) {
        span.textContent = grid[r][c];
        cell.classList.add("given");
      }

      cell.onclick = () => selectCell(cell);

      container.appendChild(cell);
    }
  }
}

/* ============================================================
   SELEÇÃO DE CÉLULA
============================================================ */
function selectCell(cell) {
  if (isPaused) return;
  const r = cell.dataset.r;
  const c = cell.dataset.c;

  if (cell.classList.contains("given")) {
    selectedCell = null;
    return;
  }

  if (selectedCell) selectedCell.classList.remove("selected");

  selectedCell = cell;
  selectedCell.classList.add("selected");
}

/* ============================================================
   NUMBER PAD
============================================================ */
function renderNumberPad() {
  const pad = document.getElementById("number-pad");
  pad.innerHTML = "";

  for (let n = 1; n <= 9; n++) {
    const btn = document.createElement("button");
    btn.textContent = n;

    btn.onclick = () => numberInput(n);

    pad.appendChild(btn);
  }
}

function numberInput(n) {
  if (!selectedCell || isPaused) return;

  const r = selectedCell.dataset.r;
  const c = selectedCell.dataset.c;

  if (notesMode) {
    addNote(selectedCell, n);
    return;
  }

  if (eliminateMode) {
    eliminateNumber(n);
    return;
  }

  placeNumber(selectedCell, r, c, n);
}

/* ============================================================
   COLOCAR NÚMERO
============================================================ */
function placeNumber(cell, r, c, n) {
  const span = cell.querySelector("span");
  const oldValue = span.textContent;

  history.push({
    type: "number",
    r, c,
    old: oldValue,
    new: n
  });

  span.textContent = n;

  if (n != solution[r][c]) {
    cell.style.color = "red";
    errors++;
    updateInfo();
  } else {
    cell.style.color = "#007bff";
    checkIfWon();
  }
}

/* ============================================================
   NOTAS
============================================================ */
function toggleNotes() {
  notesMode = !notesMode;
  document.getElementById("notes-btn").style.background =
    notesMode ? "#005fcc" : "#007bff";
}

function addNote(cell, n) {
  let span = cell.querySelector("span");

  let notes = span.dataset.notes ? span.dataset.notes.split(",") : [];

  if (!notes.includes(String(n))) notes.push(String(n));

  notes.sort();
  span.dataset.notes = notes.join(",");

  span.textContent = notes.join(" ");
}

/* ============================================================
   ELIMINAR NÚMERO
============================================================ */
function toggleEliminate() {
  eliminateMode = !eliminateMode;
  document.getElementById("eliminate-btn").style.background =
    eliminateMode ? "#005fcc" : "#007bff";
}

function eliminateNumber(n) {
  const padButtons = document.querySelectorAll("#number-pad button");
  padButtons[n - 1].style.opacity = 0.3;
}

/* ============================================================
   HINTS
============================================================ */
function giveHint() {
  if (hintsLeft <= 0 || !selectedCell) return;

  const r = selectedCell.dataset.r;
  const c = selectedCell.dataset.c;

  const correct = solution[r][c];

  history.push({
    type: "hint",
    r, c,
    old: selectedCell.querySelector("span").textContent
  });

  hintsLeft--;
  document.getElementById("hints").textContent = hintsLeft;

  selectedCell.querySelector("span").textContent = correct;
  selectedCell.style.color = "#00aa00";

  checkIfWon();
}

/* ============================================================
   UNDO
============================================================ */
function undoAction() {
  if (history.length === 0) return;

  const action = history.pop();
  const cell = document.querySelector(
    `.cell[data-r="${action.r}"][data-c="${action.c}"]`
  );

  const span = cell.querySelector("span");

  if (action.type === "number") {
    span.textContent = action.old;
    cell.style.color = "";
  }

  if (action.type === "hint") {
    span.textContent = action.old;
    hintsLeft++;
    document.getElementById("hints").textContent = hintsLeft;
  }

  updateInfo();
}

/* ============================================================
   CHECAR VITÓRIA
============================================================ */
function checkIfWon() {
  const filled = [...document.querySelectorAll(".cell:not(.given) span")]
    .every(s => s.textContent != "");

  if (!filled) return;

  const correct = [...document.querySelectorAll(".cell")].every(cell => {
    const r = cell.dataset.r;
    const c = cell.dataset.c;
    const v = cell.querySelector("span").textContent;
    return v == solution[r][c];
  });

  if (correct) {
    clearInterval(timerInterval);
    document.getElementById("final-time").textContent = formatTime(timer);
    document.getElementById("win-modal").style.display = "flex";
  }
}

/* ============================================================
   INFO BAR
============================================================ */
function updateInfo() {
  document.getElementById("time").textContent = formatTime(timer);
  document.getElementById("errors").textContent = errors;
}

/* ============================================================
   PAUSE SYSTEM
============================================================ */
function togglePause() {
  isPaused = !isPaused;

  const overlay = document.getElementById("pause-overlay");
  const pauseBtn = document.getElementById("pause");

  if (isPaused) {
    overlay.style.display = "flex";
    pauseBtn.textContent = "▶";
  } else {
    overlay.style.display = "none";
    pauseBtn.textContent = "⏸";
  }
}

/* ============================================================
   DARK MODE
============================================================ */
function toggleTheme() {
  document.body.classList.toggle("dark");
}
