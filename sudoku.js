let selectedCell = null;
const grid = Array(9).fill().map(() => Array(9).fill(0));
let solution = [];
let errors = 0;
let timer = 0;
let timerInterval = null;
let startTime = Date.now();

function generateSudoku() {
  errors = 0;
  timer = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);

  solution = createFullGrid();
  grid.forEach((r, i) => r.forEach((_, j) => grid[i][j] = solution[i][j]));
  const toRemove = parseInt(document.getElementById('difficulty').value);
  removeNumbers(grid, toRemove);

  renderGrid();
  renderNumberPad();
  updateInfo();
  document.getElementById('error-modal').style.display = 'none';
}

function createFullGrid() { /* mesma função de antes */ 
  const g = Array(9).fill().map(() => Array(9).fill(0));
  fillGrid(g); return g;
}
function fillGrid(g) { /* mesma função de antes – não mudei */ 
  for (let r=0;r<9;r++) for (let c=0;c<9;c++) if(g[r][c]===0){
    let nums=[1,2,3,4,5,6,7,8,9].sort(()=>Math.random()-0.5);
    for(let n of nums) if(isSafe(g,r,c,n)){ g[r][c]=n; if(fillGrid(g))return true; g[r][c]=0; }
    return false;
  } return true;
}
function isSafe(g,r,c,n){ for(let i=0;i<9;i++)if(g[r][i]===n||g[i][c]===n)return false;
  let br=r-r%3, bc=c-c%3; for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(g[br+i][bc+j]===n)return false;
  return true;
}
function removeNumbers(g, cnt){ let c=cnt; while(c-->0){ let r=Math.floor(Math.random()*9), co=Math.floor(Math.random()*9); if(g[r][co]!==0)g[r][co]=0; }}

function renderGrid() {
  const container = document.getElementById('sudoku-grid');
  container.innerHTML = '';
  for (let r = 0; r < 9; r++) {
    const row = document.createElement('div'); row.className='row';
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      if (grid[r][c] !== 0) {
        cell.textContent = grid[r][c];
        cell.classList.add('given');
      } else {
        cell.contentEditable = true;
        cell.dataset.r = r; cell.dataset.c = c;
        cell.addEventListener('focus', () => selectedCell = cell);
        cell.addEventListener('input', () => { if(cell.textContent.length>1) cell.textContent=cell.textContent[0]; validateCell(cell); });
        cell.addEventListener('keydown', e => e.key==='Enter' && e.preventDefault());
      }
      row.appendChild(cell);
    }
    container.appendChild(row);
  }
}

function renderNumberPad() {
  const pad = document.getElementById('number-pad');
  pad.innerHTML = '';
  for (let i=1; i<=9; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.onclick = () => { if(selectedCell) { selectedCell.textContent = i; validateCell(selectedCell); }};
    pad.appendChild(btn);
  }
  updatePad();
}

function validateCell(cell) {
  const val = parseInt(cell.textContent) || 0;
  const r = cell.dataset.r, c = cell.dataset.c;
  if (val === solution[r][c]) {
    cell.contentEditable = false;
    cell.style.color = '#006400';
    cell.style.background = '#dfffdf';
  } else if (val !== 0) {
    cell.style.color = '#d00';
    errors++;
    if (errors >= 5) { clearInterval(timerInterval); document.getElementById('error-modal').style.display='flex'; }
  }
  updateInfo();
  updatePad();
}

function updatePad() {
  const counts = Array(10).fill(0);
  document.querySelectorAll('.cell').forEach(cell => {
    const v = parseInt(cell.textContent)||0;
    if (v>0 && cell.style.color!=='rgb(208, 0, 0)') counts[v]++; // só conta se não for erro
  });
  document.querySelectorAll('#number-pad button').forEach((b,i) => b.disabled = counts[i+1]===9);
}

function updateTimer() { timer++; updateInfo(); }
function updateInfo() {
  const points = Math.max(0, 10000 - timer*10 - errors*200);
  document.getElementById('info').textContent = Pontos: \( {points} | Erros: \){errors} | Tempo: ${timer}s;
}

function continueWithAd() {
  alert("Anúncio assistido! Erros zerados!");
  errors = 0;
  document.getElementById('error-modal').style.display='none';
  timerInterval = setInterval(updateTimer, 1000);
}

// inicia só quando a página estiver pronta
window.onload = generateSudoku;
