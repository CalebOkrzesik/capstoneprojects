/*
Author: Caleb Okrzesik
Date: Updated 12/4/2025
Purpose: Browser Sudoku game with solver selection (backtracking + random)
*/

let gameBoard = [];
let selectedCell = null;

// ------------------------------------------------------------
// INITIAL BOARD GENERATION
// ------------------------------------------------------------

function initBoard() {
    gameBoard = Array.from({ length: 9 }, () => Array(9).fill(0));

    function fillCell(row, col) {
        if (row === 9) return true;
        if (col === 9) return fillCell(row + 1, 0);

        let numbers = Array.from({ length: 9 }, (_, i) => i + 1);
        numbers.sort(() => Math.random() - 0.5);

        for (let num of numbers) {
            if (checkIfValid(gameBoard, row, col, num)) {
                gameBoard[row][col] = num;
                if (fillCell(row, col + 1)) return true;
                gameBoard[row][col] = 0;
            }
        }
        return false;
    }

    fillCell(0, 0);
}

// ------------------------------------------------------------
// VALIDATION
// ------------------------------------------------------------

function checkIfValid(board, row, col, num) {
    if (board[row].includes(num)) return false;

    for (let r = 0; r < 9; r++)
        if (board[r][col] === num) return false;

    let startRow = Math.floor(row / 3) * 3;
    let startCol = Math.floor(col / 3) * 3;

    for (let r = startRow; r < startRow + 3; r++)
        for (let c = startCol; c < startCol + 3; c++)
            if (board[r][c] === num) return false;

    return true;
}

// ------------------------------------------------------------
// DIFFICULTY
// ------------------------------------------------------------

function setGameDiff(difficulty) {
    let numToClear;

    if (difficulty === 1) numToClear = 81 - (30 + Math.floor(Math.random() * 6));
    else if (difficulty === 2) numToClear = 81 - (25 + Math.floor(Math.random() * 6));
    else numToClear = 81 - (20 + Math.floor(Math.random() * 6));

    let cleared = 0;
    while (cleared < numToClear) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        if (gameBoard[row][col] !== 0) {
            gameBoard[row][col] = 0;
            cleared++;
        }
    }
}

// ------------------------------------------------------------
// DISPLAY BOARD
// ------------------------------------------------------------

function displayBoard() {
    const boardDiv = document.getElementById("sudokuBoard");
    boardDiv.innerHTML = "";

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            if (gameBoard[r][c] !== 0) {
                cell.textContent = gameBoard[r][c];
                cell.classList.add("filled");
            }

            cell.dataset.row = r;
            cell.dataset.col = c;

            cell.addEventListener("click", () => selectCell(cell));
            boardDiv.appendChild(cell);
        }
    }
}

// ------------------------------------------------------------
// USER ENTRY
// ------------------------------------------------------------

function selectCell(cell) {
    if (cell.classList.contains("filled")) return;

    if (selectedCell) selectedCell.classList.remove("selected");
    selectedCell = cell;
    cell.classList.add("selected");

    let num = prompt("Enter a number (1-9):");
    num = parseInt(num);

    if (num >= 1 && num <= 9) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (placeNumber(row, col, num)) {
            displayBoard();
            if (isBoardComplete()) alert("You completed the puzzle!");
        } else {
            alert("Invalid move.");
        }
    }
}

function placeNumber(row, col, num) {
    if (!checkIfValid(gameBoard, row, col, num)) return false;
    gameBoard[row][col] = num;
    return true;
}

function isBoardComplete() {
    return gameBoard.every(row => row.every(cell => cell !== 0));
}

// ------------------------------------------------------------
// SOLVERS (same as the Python version)
// ------------------------------------------------------------

// -------- Backtracking Solver --------

function solveBacktracking(board) {
    let empty = findEmpty(board);
    if (!empty) return true;

    let [row, col] = empty;

    for (let num = 1; num <= 9; num++) {
        if (checkIfValid(board, row, col, num)) {
            board[row][col] = num;

            if (solveBacktracking(board)) return true;

            board[row][col] = 0;
        }
    }

    return false;
}

// -------- Random Fill Solver (less reliable) --------

function solveRandom(board) {
    let empty = findEmpty(board);
    if (!empty) return true;

    let [row, col] = empty;
    let nums = Array.from({ length: 9 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);

    for (let num of nums) {
        if (checkIfValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveRandom(board)) return true;
            board[row][col] = 0;
        }
    }

    return false;
}

// -------- Utility --------

function findEmpty(board) {
    for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++)
            if (board[r][c] === 0) return [r, c];

    return null;
}

// ------------------------------------------------------------
// EVENT LISTENERS
// ------------------------------------------------------------

document.getElementById("startBtn").addEventListener("click", () => {
    const difficulty = parseInt(document.getElementById("difficulty").value);
    initBoard();
    setGameDiff(difficulty);
    displayBoard();
});

// NEW: Solve button
document.getElementById("solveBtn").addEventListener("click", () => {
    const solver = document.getElementById("solverType").value;

    if (solver === "backtracking") {
        solveBacktracking(gameBoard);
        alert("Solved using Backtracking!");
    } else {
        solveRandom(gameBoard);
        alert("Solved using Random Fill!");
    }

    displayBoard();
});
