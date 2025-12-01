let selectedCell = null;
const grid = Array(9).fill().map(() => Array(9).fill(0));
let solution = [];
let errors = 0;
let timer = 0;
let timerInterval;
let score = 0;

function generateSudoku() {
  errors = 0;
  timer = 0;
  score = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => { timer++; updateScore(); }, 1000);
  solution = createFullGrid();
  grid.forEach((row, i) => row.forEach((_, j) => grid[i][j] = solution[i][j]));
  const difficulty = parseInt(document.getElementById('difficulty').value);
  removeNumbers(grid, difficulty);
  displayGrid();
  createNumberPad();
  updateScore();
  document.getElementById('error-modal').style.display = 'none';
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
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (g[br + i][bc + j] === num) return false;
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
        cell.addEventListener('keydown', preventEnter);
      }
      row.appendChild(cell);
    }
    container.appendChild(row);
  }
}

function preventEnter(e) {
  if (e.key === 'Enter') { e.preventDefault(); }
}

function createNumberPad() {
  let pad = document.getElementById('number-pad');
  if (pad) pad.remove();
  pad = document.createElement('div');
  pad.id = 'number-pad';
  for (let i = 1; i <= 9; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.onclick = () => { if (selectedCell) selectedCell.textContent = i; checkAll(); updatePad(); };
    pad.appendChild(btn);
  }
  document.querySelector('.container').appendChild(pad);
  updatePad();
}

function updatePad() {
  const counts = Array(10).fill(0);
  document.querySelectorAll('.cell').forEach(cell => {
    const val = parseInt(cell.textContent) || 0;
    if (val > 0) counts[val]++;
  });
  document.querySelectorAll('#number-pad button').forEach((btn, idx) => {
    btn.disabled = counts[idx + 1] === 9;
  });
}

function checkInput(e) {
  const cell = e.target;
  let val = cell.textContent.trim();
  if (!/^[1-9]?$/.test(val)) { cell.textContent = ''; return; }
  checkAll();
}

function checkAll() {
  let correctCount = 0;
  let newErrors = 0;
  document.querySelectorAll('.cell[contenteditable="true"]').forEach(cell => {
    const r = cell.dataset.row, c = cell.dataset.col;
    const val = parseInt(cell.textContent) || 0;
    if (val !== 0) {
      if (val === solution[r][c]) {
        cell.contentEditable = false; // trava se correto
        cell.style.background = '#e0ffe0';
        cell.style.color = '#006600';
        correctCount++;
      } else {
        cell.style.color = '#ff0000';
        newErrors++;
      }
    } else {
      cell.style.color = '#000';
    }
  });
  errors += newErrors;
  if (errors >= 5) showErrorModal();
  if (correctCount === 81 - document.querySelectorAll('.given').length) {
    clearInterval(timerInterval);
    alert(Parabéns! Pontos finais: ${score} 🎉);
  }
  updateScore();
}

function updateScore() {
  score = 10000 - (timer * 10) - (errors * 200);
  if (score < 0) score = 0;
  document.getElementById('score').textContent = Pontos: \( {score} | Erros: \){errors} | Tempo: ${timer}s;
}

function showErrorModal() {
  clearInterval(timerInterval);
  document.getElementById('error-modal').style.display = 'block';
}

function continueWithAd() {
  // Simula anúncio (em real, integre AdSense aqui)
  alert('Assistindo anúncio... (simulado – erros zerados!)');
  errors = 0;
  timerInterval = setInterval(() => { timer++; updateScore(); }, 1000);
  document.getElementById('error-modal').style.display = 'none';
}

// inicia
generateSudoku();
