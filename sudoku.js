/* =========================================
   VARIABLES
========================================= */
let selectedCell = null;
let notesMode = false;

let grid = Array(9).fill().map(() => Array(9).fill(0));
let solution = [];

let errors = 0;
let timer = 0;
let timerInterval = null;

/* =========================================
   INITIALIZATION
========================================= */
window.onload = () => {
  document.getElementById("new-game").onclick = generateSudoku;
  document.getElementById("notes").onclick = toggleNotes;
  document.getElementById("erase").onclick = eraseCell;
  document.getElementById("check").onclick = checkProgress;
  document.getElementById("hint").onclick = giveHint;
  document.getElementById("toggle-theme").onclick = toggleTheme;

  loadTheme();
  generateSudoku();
};

/* =========================================
   THEME (Dark / Light)
========================================= */
function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

function loadTheme() {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
}

/* =========================================
   SUDOKU GENERATION
========================================= */
function generateSudoku() {
  // Reset
  clearInterval(timerInterval);
  timer = 0;
  errors = 0;
  updateInfo();

  timerInterval = setInterval(() => {
    timer++;
    updateInfo();
  }, 1000);

  // Generate full solution
  solution = createFullGrid();

  // Copy solution into user grid
  grid = solution.map(row => [...row]);

  // Remove numbers by difficulty
  const removeCount = parseInt(document.getElementById("difficulty").value);
  removeNumbers(removeCount);

  renderGrid();
  renderNumberPad();

  document.getElementById("end-modal").style.display = "none";
  document.getElementById("error-modal").style.display = "none";
}

function createFullGrid() {
  let newGrid = Array(9).fill().map(() => Array(9).fill(0));
  fillGrid(newGrid);
  return newGrid;
}

function fillGrid(g) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (g[r][c] === 0) {
        let nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
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
    if (g[r][i] === n || g[i][c] === n) return false;
  }

  let br = r - (r % 3), bc = c - (c % 3);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (g[br+i][bc+j] === n) return false;

  return true;
}

function removeNumbers(count) {
  while (count > 0) {
    let r = Math.floor(Math.random() * 9);
    let c = Math.floor(Math.random() * 9);
    if (grid[r][c] !== 0) {
      grid[r][c] = 0;
      count--;
    }
  }
}

/* =========================================
   RENDERING GRID
========================================= */
function renderGrid() {
  const container = document.getElementById("sudoku-grid");
  container.innerHTML = "";
  selectedCell = null;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.r = r;
      cell.dataset.c = c;

      if (grid[r][c] !== 0) {
        cell.textContent = grid[r][c];
        cell.classList.add("given");
      } else {
        cell.textContent = "";
        cell.contentEditable = false;
        cell.onclick = () => selectCell(cell);
      }

      container.appendChild(cell);
    }
  }
}

function selectCell(cell) {
  // Clear old highlights
  document.querySelectorAll(".cell").forEach(c => {
    c.classList.remove("selected", "related", "same-number");
  });

  cell.classList.add("selected");
  selectedCell = cell;

  const r = parseInt(cell.dataset.r);
  const c = parseInt(cell.dataset.c);

  highlightRelations(r, c);

  if (cell.textContent !== "") {
    highlightSameNumbers(cell.textContent);
  }
}

function highlightRelations(r, c) {
  document.querySelectorAll(".cell").forEach(cell => {
    const rr = parseInt(cell.dataset.r);
    const cc = parseInt(cell.dataset.c);

    if (rr === r || cc === c) {
      cell.classList.add("related");
    }

    // block
    if (Math.floor(rr / 3) === Math.floor(r / 3) &&
        Math.floor(cc / 3) === Math.floor(c / 3)) {
      cell.classList.add("related");
    }
  });
}

function highlightSameNumbers(n) {
  document.querySelectorAll(".cell").forEach(cell => {
    if (cell.textContent === n) {
      cell.classList.add("same-number");
    }
  });
}

/* =========================================
   NUMBER PAD
========================================= */
function renderNumberPad() {
  const pad = document.getElementById("number-pad");
  pad.innerHTML = "";

  for (let i = 1; i <= 9; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => handleInput(i);
    pad.appendChild(btn);
  }
}

function handleInput(num) {
  if (!selectedCell) return;

  const r = parseInt(selectedCell.dataset.r);
  const c = parseInt(selectedCell.dataset.c);

  if (grid[r][c] !== 0) return; // can't modify given numbers

  if (notesMode) {
    selectedCell.textContent = selectedCell.textContent.includes(num)
      ? selectedCell.textContent.replace(num, "")
      : selectedCell.textContent + num;
    return;
  }

  selectedCell.textContent = num;
  validateMove(r, c, num);
}

/* =========================================
   VALIDATION & GAME PROGRESS
========================================= */
function validateMove(r, c, value) {
  if (solution[r][c] == value) {
    // correct
  } else {
    errors++;
    if (errors >= 5) {
      clearInterval(timerInterval);
      document.getElementById("error-modal").style.display = "flex";
    }
  }

  updateInfo();
  checkIfCompleted();
}

function updateInfo() {
  const points = Math.max(0, 10000 - timer * 10 - errors * 300);
  document.getElementById("info").textContent =
    `Pontos: ${points} | Erros: ${errors} | Tempo: ${timer}s`;
}

function checkIfCompleted() {
  const allFilled = [...document.querySelectorAll(".cell")]
    .every(cell => cell.textContent !== "");

  if (!allFilled) return;

  // Check if correct
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (parseInt(document.querySelector(`[data-r='${r}'][data-c='${c}']`).textContent) !== solution[r][c])
        return;

  // completed
  clearInterval(timerInterval);
  showEndModal();
}

function showEndModal() {
  const modal = document.getElementById("end-modal");
  modal.style.display = "flex";

  document.getElementById("end-message").textContent =
    `Você concluiu em ${timer}s com ${errors} erros!`;
}

/* =========================================
   BUTTONS
========================================= */

function toggleNotes() {
  notesMode = !notesMode;
  document.getElementById("notes").style.background =
    notesMode ? "#005ec9" : "#007bff";
}

function eraseCell() {
  if (!selectedCell) return;
  const r = parseInt(selectedCell.dataset.r);
  const c = parseInt(selectedCell.dataset.c);
  if (grid[r][c] === 0) {
    selectedCell.textContent = "";
  }
}

function checkProgress() {
  checkIfCompleted();
}

function giveHint() {
  if (!selectedCell) return;

  const r = parseInt(selectedCell.dataset.r);
  const c = parseInt(selectedCell.dataset.c);

  if (grid[r][c] === 0) {
    const correct = solution[r][c];
    selectedCell.textContent = correct;
  }

  checkIfCompleted();
}

/* =========================================
   ADS CONTINUE
========================================= */
function continueWithAd() {
  alert("Simulação de anúncio exibido!");
  errors = 0;
  document.getElementById("error-modal").style.display = "none";
  timerInterval = setInterval(() => {
    timer++;
    updateInfo();
  }, 1000);
}
