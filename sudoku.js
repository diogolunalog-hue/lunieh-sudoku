let selectedCell = null;
const grid = Array(9).fill().map(() => Array(9).fill(0));
let solution = [];

function generateSudoku() {
  // Gera grid completo
  solution = createFullGrid();
  grid.forEach((row, i) => row.forEach((_, j) => grid[i][j] = solution[i][j]));
  removeNumbers(grid, 42); // dificuldade média
  displayGrid();
  createNumberPad();
}

function createFullGrid() {
  const g = Array(9).fill().map(() => Array(9).fill(0));
  fillGrid(g);
  return g;
}

function fillGrid(g) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (g[row][col] === 0) {
        const nums = shuffle([1,2,3,4,5,6,7,8,9]);
        for (let num of nums) {
          if (isSafe(g, row, col, num)) {
            g[row][col] = num;
            if (fillGrid(g)) return true;
            g[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function isSafe(g, row, col, num) {
  for (let i = 0; i < 9; i++) if (g[row][i] === num || g[i][col] === num) return false;
  const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (g[br + i][bc + j] === num) return false;
  return true;
}

function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function removeNumbers(g, count) {
  while (count > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (g[row][col] !== 0) { g[row][col] = 0; count--; }
  }
}

function displayGrid() {
  const container = document.getElementById('sudoku-grid');
  container.innerHTML = '';
  for (let r = 0; r < 9; r++) {
    const row = document.createElement('div');
    row.className = 'row';
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      if (grid[r][c] !== 0) {
        cell.textContent = grid[r][c];
        cell.classList.add('given');
      } else {
        cell.contentEditable = true;
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.addEventListener('focus', () => selectedCell = cell);
        cell.addEventListener('input', checkInput);
      }
      row.appendChild(cell);
    }
    container.appendChild(row);
  }
}

function createNumberPad() {
  let pad = document.getElementById('number-pad');
  if (pad) pad.remove();
  pad = document.createElement('div');
  pad.id = 'number-pad';
  for (let i = 1; i <= 9; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.onclick = () => { if (selectedCell) selectedCell.textContent = i; checkAll(); };
    pad.appendChild(btn);
  }
  document.querySelector('.container').appendChild(pad);
}

function checkInput(e) {
  const val = e.target.textContent;
  if (!/^[1-9]?$/.test(val)) e.target.textContent = '';
  checkAll();
}

function checkAll() {
  let correct = true;
  document.querySelectorAll('.cell[contenteditable="true"]').forEach(cell => {
    const r = cell.dataset.row, c = cell.dataset.col;
    if (cell.textContent && parseInt(cell.textContent) !== solution[r][c]) {
      cell.style.color = '#ff6b6b';
      correct = false;
    } else if (cell.textContent) {
      cell.style.color = '#00ffaa';
    } else {
      cell.style.color = '#fff';
    }
  });
  if (correct && [...grid.flat()].filter(x => x === 0).length === 0) {
    setTimeout(() => alert('Parabéns! Você completou o Sudoku! 🎉'), 500);
  }
}

// inicia
generateSudoku();

// gera o primeiro puzzle automaticamente
generateSudoku();
