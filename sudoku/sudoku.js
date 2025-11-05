/*
Author: Caleb Okrzesik
Date: 11/4/2025
Purpose: Allows user to run and play Sudoku in the browser
*/

let gameBoard = [];
let selectedCell = null;

// Initialize board
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
                gameBoard[row][col] = 0; // backtrack
            }
        }
        return false;
    }

    fillCell(0, 0);
}

// Check if number can be placed
function checkIfValid(board, row, col, num) {
    if (board[row].includes(num)) return false;
    for (let r = 0; r < 9; r++) if (board[r][col] === num) return false;

    let startRow = Math.floor(row / 3) * 3;
    let startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++)
        for (let c = startCol; c < startCol + 3; c++)
            if (board[r][c] === num) return false;

    return true;
}

// Clear cells based on difficulty
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

// Display board on webpage
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

// Handle cell click
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
            if (isBoardComplete()) alert("Congratulations! You completed the Sudoku board!");
        } else {
            alert("Invalid move. Try again.");
        }
    }
}

// Place number if valid
function placeNumber(row, col, num) {
    if (!checkIfValid(gameBoard, row, col, num)) return false;
    gameBoard[row][col] = num;
    return true;
}

// Check if board is complete
function isBoardComplete() {
    return gameBoard.every(row => row.every(cell => cell !== 0));
}

// Start game
document.getElementById("startBtn").addEventListener("click", () => {
    const difficulty = parseInt(document.getElementById("difficulty").value);
    initBoard();
    setGameDiff(difficulty);
    displayBoard();
});
