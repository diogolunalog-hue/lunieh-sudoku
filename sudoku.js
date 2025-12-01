/* ——————————————————————————————
   VARIÁVEIS GLOBAIS
—————————————————————————————— */
let selected = null;
let grid = [];
let solution = [];
let mistakes = 0;
let notesMode = false;
let timer = 0;
let timerInterval = null;

/* ——————————————————————————————
   INICIALIZAÇÃO
—————————————————————————————— */
document.getElementById("new-game").addEventListener("click", generateSudoku);
document.getElementById("toggle-dark").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

document.getElementById("erase-btn").addEventListener("click", eraseCell);
document.getElementById("notes-btn").addEventListener("click", toggleNotes);
document.getElementById("hint-btn").addEventListener("click", giveHint);
document.getElementById("check-btn").addEventListener("click", checkBoard);
document.getElementById("continue-ad").addEventListener("click", continueAfterAd);
document.getElementById("restart-modal").addEventListener("click", generateSudoku);

/* ——————————————————————————————
   GERADOR DE SUDOKU
—————————————————————————————— */
function generateSudoku() {
  mistakes = 0;
  timer = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer++;
    updateInfo();
  }, 1000);

  grid = Array.from({length:9}, ()=>Array(9).fill(0));
  solution = Array.from({length:9}, ()=>Array(9).fill(0));

  fillGrid(solution);
  grid = solution.map(r=>[...r]);

  let holes = Number(document.getElementById("difficulty").value);
  removeNumbers(grid, holes);

  renderGrid();
  renderPad();
  updateInfo();

  document.getElementById("error-modal").style.display = "none";
}

/* ——————————————————————————————
   GERAÇÃO REAL DE UM SUDOKU
—————————————————————————————— */
function fillGrid(g) {
  for (let r=0; r<9; r++) {
    for (let c=0; c<9; c++) {
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

function removeNumbers(g, cnt) {
  while (cnt > 0) {
    let r = Math.floor(Math.random()*9);
    let c = Math.floor(Math.random()*9);
    if (g[r][c] !== 0) {
      g[r][c] = 0;
      cnt--;
    }
  }
}

function isSafe(g, r, c, n) {
  for (let i=0; i<9; i++)
    if (g[r][i] === n || g[i][c] === n) return false;

  let br = r - (r % 3),
      bc = c - (c % 3);

  for (let i=0; i<3; i++)
    for (let j=0; j<3; j++)
      if (g[br+i][bc+j] === n) return false;

  return true;
}

function shuffle(a) {
  for (let i = a.length-1; i>0; i--) {
    let j = Math.floor(Math.random()* (i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ——————————————————————————————
   RENDERIZAÇÃO DO TABULEIRO
—————————————————————————————— */
function renderGrid() {
  const board = document.getElementById("sudoku-grid");
  board.innerHTML = "";

  for (let r=0; r<9; r++) {
    for (let c=0; c<9; c++) {

      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.r = r;
      cell.dataset.c = c;

      if (grid[r][c] !== 0) {
        cell.textContent = grid[r][c];
        cell.classList.add("given");
      } else {
        cell.addEventListener("click", () => selectCell(r,c));
      }

      board.appendChild(cell);
    }
  }
}

/* ——————————————————————————————
   SELEÇÃO + DESTAQUES
—————————————————————————————— */
function selectCell(r, c) {
  selected = {r,c};
  highlightBoard();
}

function highlightBoard() {
  document.querySelectorAll(".cell").forEach(cell => {
    cell.classList.remove("selected","related","same-number");
  });

  if (!selected) return;

  const {r, c} = selected;
  const value = grid[r][c];

  document.querySelectorAll(".cell").forEach(cell => {
    let R = Number(cell.dataset.r);
    let C = Number(cell.dataset.c);
    let V = cell.textContent;

    if (R === r && C === c) cell.classList.add("selected");
    if (R === r || C === c) cell.classList.add("related");

    if (Math.floor(R/3) === Math.floor(r/3) &&
        Math.floor(C/3) === Math.floor(c/3)) {
      cell.classList.add("related");
    }

    if (V && V === String(value)) cell.classList.add("same-number");
  });
}

/* ——————————————————————————————
   INTERAÇÃO - TECLADO NUMÉRICO
—————————————————————————————— */
function renderPad() {
  const pad = document.getElementById("number-pad");
  pad.innerHTML = "";

  for (let n=1; n<=9; n++) {
    const btn = document.createElement("button");
    btn.textContent = n;
    btn.addEventListener("click", () => handleInput(n));
    pad.appendChild(btn);
  }
}

function handleInput(n) {
  if (!selected) return;
  const {r,c} = selected;

  if (document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`).classList.contains("given"))
    return;

  if (notesMode) {
    addNote(r,c,n);
    return;
  }

  grid[r][c] = n;
  renderGrid();
  highlightBoard();
  validateMove(r,c);
}

/* ——————————————————————————————
   NOTES (ANOTAÇÕES)
—————————————————————————————— */
function toggleNotes() {
  notesMode = !notesMode;
  document.getElementById("notes-btn").style.background = notesMode ? "#9ab" : "";
}

function addNote(r,c,n) {
  const cell = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);

  if (cell.classList.contains("given")) return;

  if (!cell.dataset.notes) cell.dataset.notes = JSON.stringify([]);
  let arr = JSON.parse(cell.dataset.notes);

  if (arr.includes(n)) arr = arr.filter(x => x!==n);
  else arr.push(n);

  cell.dataset.notes = JSON.stringify(arr);

  cell.innerHTML =
    `<div class="notes">${[1,2,3,4,5,6,7,8,9].map(num =>
      arr.includes(num)? num : ""
    ).join("")}</div>`;
}

/* ——————————————————————————————
   APAGAR
—————————————————————————————— */
function eraseCell() {
  if (!selected) return;

  const {r,c} = selected;
  if (document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`).classList.contains("given"))
    return;

  grid[r][c] = 0;
  renderGrid();
  highlightBoard();
}

/* ——————————————————————————————
   VALIDAR MOVIMENTO
—————————————————————————————— */
function validateMove(r,c) {
  if (grid[r][c] === solution[r][c]) return;

  mistakes++;
  updateInfo();

  if (mistakes >= 5) {
    clearInterval(timerInterval);
    document.getElementById("error-modal").style.display = "flex";
  }
}

/* ——————————————————————————————
   DICA REAL
—————————————————————————————— */
function giveHint() {
  let empties = [];
  for (let r=0;r<9;r++)
    for (let c=0;c<9;c++)
      if (grid[r][c] === 0)
        empties.push({r,c});

  if (empties.length === 0) return;

  let chosen = empties[Math.floor(Math.random()*empties.length)];
  let {r,c} = chosen;

  grid[r][c] = solution[r][c];
  renderGrid();
  highlightBoard();
}

/* ——————————————————————————————
   CHECAR TABULEIRO
—————————————————————————————— */
function checkBoard() {
  for (let r=0;r<9;r++)
    for (let c=0;c<9;c++)
      if (grid[r][c] !== solution[r][c]) return alert("Ainda há erros!");

  alert("Parabéns! Sudoku resolvido!");
}

/* ——————————————————————————————
   TIMER / SCORE
—————————————————————————————— */
function updateInfo() {
  document.getElementById("mistakes").textContent = mistakes;

  document.getElementById("time").textContent =
    new Date(timer * 1000).toISOString().substr(14,5);

  const score = Math.max(0, 5000 - timer*5 - mistakes*200);
  document.getElementById("score").textContent = score;
}

/* ——————————————————————————————
   CONTINUAR APÓS PROPAGANDA
—————————————————————————————— */
function continueAfterAd() {
  mistakes = 0;
  timerInterval = setInterval(() => {
    timer++;
    updateInfo();
  }, 1000);
  document.getElementById("error-modal").style.display = "none";
}

/* ——————————————————————————————
   INÍCIO AUTOMÁTICO
—————————————————————————————— */
window.onload = generateSudoku;
