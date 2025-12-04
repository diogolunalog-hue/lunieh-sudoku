// ===== Variáveis Globais =====
const gridElement = document.getElementById('sudoku-grid');
const numberPad = document.getElementById('number-pad');
const errorsEl = document.getElementById('errors');
const timeEl = document.getElementById('time');
const hintsEl = document.getElementById('hints');
const pauseOverlay = document.getElementById('pause-overlay');
const winModal = document.getElementById('win-modal');
const finalTime = document.getElementById('final-time');

let sudokuGrid = [];
let solutionGrid = [];
let selectedCell = null;
let errors = 0;
let hints = 3;
let timer;
let time = 0;
let notesMode = false;
let history = [];

// ===== Função de Geração de Sudoku (simplificada) =====
function generateSudoku(difficulty = 30) {
    // Sudoku inicial simples para demonstração
    sudokuGrid = Array(9).fill().map(() => Array(9).fill(''));
    solutionGrid = Array(9).fill().map(() => Array(9).fill(''));
    
    // Preencher algumas células aleatórias como exemplo
    let count = 0;
    while (count < difficulty) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        if (sudokuGrid[row][col] === '') {
            let value = Math.floor(Math.random() * 9) + 1;
            sudokuGrid[row][col] = value;
            solutionGrid[row][col] = value; // para demonstração
            count++;
        }
    }

    renderGrid();
    startTimer();
}

// ===== Renderizar Grid =====
function renderGrid() {
    gridElement.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (sudokuGrid[i][j] !== '') {
                cell.textContent = sudokuGrid[i][j];
                cell.classList.add('prefilled');
            }
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', () => selectCell(cell));
            gridElement.appendChild(cell);
        }
    }
}

// ===== Selecionar Célula =====
function selectCell(cell) {
    if (selectedCell) selectedCell.classList.remove('selected');
    if (!cell.classList.contains('prefilled')) {
        selectedCell = cell;
        cell.classList.add('selected');
    } else {
        selectedCell = null;
    }
}

// ===== Renderizar Number Pad =====
function renderNumberPad() {
    numberPad.innerHTML = '';
    for (let i = 1; i <= 9; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.addEventListener('click', () => handleNumberInput(i));
        numberPad.appendChild(btn);
    }
}

// ===== Inserir Número na Célula =====
function handleNumberInput(number) {
    if (!selectedCell) return;

    const row = selectedCell.dataset.row;
    const col = selectedCell.dataset.col;

    // Salvar no histórico
    history.push({
        row,
        col,
        prevValue: selectedCell.textContent
    });

    if (notesMode) {
        selectedCell.textContent = number; // para simplificação, sem notas múltiplas
    } else {
        if (solutionGrid[row][col] && solutionGrid[row][col] != number) {
            errors++;
            errorsEl.textContent = errors;
            selectedCell.classList.add('error');
            setTimeout(() => selectedCell.classList.remove('error'), 500);
        } else {
            selectedCell.textContent = number;
            sudokuGrid[row][col] = number;
            checkWin();
        }
    }
}

// ===== Checar Vitória =====
function checkWin() {
    for (let i = 0; i < 9; i++)
        for (let j = 0; j < 9; j++)
            if (sudokuGrid[i][j] === '') return;

    stopTimer();
    finalTime.textContent = formatTime(time);
    winModal.style.display = 'flex';
}

// ===== Botão Desfazer =====
document.getElementById('undo-btn').addEventListener('click', () => {
    if (history.length === 0) return;
    const lastMove = history.pop();
    const cell = document.querySelector(`.cell[data-row='${lastMove.row}'][data-col='${lastMove.col}']`);
    cell.textContent = lastMove.prevValue;
    sudokuGrid[lastMove.row][lastMove.col] = lastMove.prevValue || '';
});

// ===== Botão Dica =====
document.getElementById('hint-btn').addEventListener('click', () => {
    if (!selectedCell || hints <= 0) return;
    const row = selectedCell.dataset.row;
    const col = selectedCell.dataset.col;
    const hintValue = solutionGrid[row][col];
    selectedCell.textContent = hintValue;
    sudokuGrid[row][col] = hintValue;
    hints--;
    hintsEl.textContent = hints;
    checkWin();
});

// ===== Notas =====
document.getElementById('notes-btn').addEventListener('click', () => {
    notesMode = !notesMode;
    document.getElementById('notes-btn').style.backgroundColor = notesMode ? '#007bff' : '#f0f0f0';
});

// ===== Novo Jogo =====
document.getElementById('new-game').addEventListener('click', () => {
    generateSudoku(document.getElementById('difficulty').value);
    errors = 0;
    errorsEl.textContent = errors;
    hints = 3;
    hintsEl.textContent = hints;
    history = [];
});

// ===== Pause / Resume =====
document.getElementById('pause').addEventListener('click', () => {
    stopTimer();
    pauseOverlay.style.display = 'flex';
});
document.getElementById('resume-btn').addEventListener('click', () => {
    pauseOverlay.style.display = 'none';
    startTimer();
});

// ===== Jogar Novamente =====
document.getElementById('play-again').addEventListener('click', () => {
    winModal.style.display = 'none';
    generateSudoku(document.getElementById('difficulty').value);
    errors = 0;
    errorsEl.textContent = errors;
    hints = 3;
    hintsEl.textContent = hints;
    history = [];
});

// ===== Timer =====
function startTimer() {
    stopTimer();
    time = 0;
    timer = setInterval(() => {
        time++;
        timeEl.textContent = formatTime(time);
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2,'0');
    const s = (seconds % 60).toString().padStart(2,'0');
    return `${m}:${s}`;
}

// ===== Inicialização =====
renderNumberPad();
generateSudoku(30);
