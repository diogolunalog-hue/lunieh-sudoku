function generateSudoku() {
  const grid = createFullGrid();
  removeNumbers(grid, 42); // dificuldade média
  displayGrid(grid);
}

function createFullGrid() {
  const grid = Array(9).fill().map(() => Array(9).fill(0));
  fillGrid(grid);
  return grid;
}

function fillGrid(grid, row = 0, col = 0) {
  if (col === 9) { row++; col = 0; }
  if (row === 9) return true;
  if (grid[row][col] !== 0) return fillGrid(grid, row, col + 1);

  const nums = shuffle([1,2,3,4,5,6,7,8,9]);
  for (let num of nums) {
    if (isSafe(grid, row, col, num)) {
      grid[row][col] = num;
      if (fillGrid(grid, row, col + 1)) return true;
      grid[row][col] = 0;
    }
  }
  return false;
}

function isSafe(grid, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num || grid[i][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (grid[boxRow + i][boxCol + j] === num) return false;
  return true;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function removeNumbers(grid, count) {
  while (count > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (grid[row][col] !== 0) {
      grid[row][col] = 0;
      count--;
    }
  }
}

function displayGrid(grid) {
  const container = document.getElementById('sudoku-grid');
  container.innerHTML = '';
  for (let r = 0; r < 9; r++) {
    const row = document.createElement('div');
    row.className = 'row';
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = grid[r][c] || '';
      row.appendChild(cell);
    }
    container.appendChild(row);
  }
}

// gera o primeiro puzzle automaticamente
generateSudoku();
