/*
Author: Caleb Okrzesik
Date: Updated 12/04/2025
Purpose: Browser Sudoku game with solver selection (backtracking + random)
*/

let gameBoard = [];
let selectedCell = null;

// ------------------------------------------------------------
// INITIAL BOARD GENERATION
// ------------------------------------------------------------
function initBoard() {
    // create empty board
    gameBoard = Array.from({ length: 9 }, () => Array(9).fill(0));

    function fillCell(row, col) {
        if (row === 9) return true;
        if (col === 9) return fillCell(row + 1, 0);

        let numbers = Array.from({ length: 9 }, (_, i) => i + 1);
        // shuffle
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }

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
    // row check
    if (board[row].includes(num)) return false;

    // column check
    for (let r = 0; r < 9; r++) {
        if (board[r][col] === num) return false;
    }

    // 3x3 box check
    let startRow = Math.floor(row / 3) * 3;
    let startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
            if (board[r][c] === num) return false;
        }
    }

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
            } else {
                // explicitly ensure empty text for empty cells
                cell.textContent = "";
            }

            cell.dataset.row = r;
            cell.dataset.col = c;

            // attach selection only to empty cells
            cell.addEventListener("click", () => selectCell(cell));

            boardDiv.appendChild(cell);
        }
    }
}

// ------------------------------------------------------------
// USER ENTRY
// ------------------------------------------------------------
function selectCell(cell) {
    // don't allow selecting pre-filled cells
    if (cell.classList.contains("filled")) return;

    if (selectedCell) selectedCell.classList.remove("selected");
    selectedCell = cell;
    cell.classList.add("selected");

    let num = prompt("Enter a number (1-9):");
    if (num === null) {
        // user cancelled prompt
        cell.classList.remove("selected");
        selectedCell = null;
        return;
    }

    num = parseInt(num, 10);
    if (Number.isInteger(num) && num >= 1 && num <= 9) {
        const row = parseInt(cell.dataset.row, 10);
        const col = parseInt(cell.dataset.col, 10);

        if (placeNumber(row, col, num)) {
            displayBoard();
            if (isBoardComplete()) {
                alert("Congratulations! You completed the Sudoku board!");
            }
        } else {
            alert("Invalid move. Try again.");
        }
    } else {
        alert("Please enter a valid integer between 1 and 9.");
    }

    // clear selection
    selectedCell = null;
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

// ------------------------------------------------------------
// SOLVERS
// ------------------------------------------------------------

// Backtracking solver (fast and reliable)
function solveBacktracking(board) {
    const empty = findEmpty(board);
    if (!empty) return true;

    const [row, col] = empty;
    for (let num = 1; num <= 9; num++) {
        if (checkIfValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveBacktracking(board)) return true;
            board[row][col] = 0;
        }
    }
    return false;
}

// Random fill solver (experimental, not guaranteed)
function solveRandom(board) {
    const empty = findEmpty(board);
    if (!empty) return true;

    const [row, col] = empty;
    let nums = Array.from({ length: 9 }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nums[i], nums[j]] = [nums[j], nums[i]];
    }

    for (let num of nums) {
        if (checkIfValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveRandom(board)) return true;
            board[row][col] = 0;
        }
    }
    return false;
}

function findEmpty(board) {
    for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++)
            if (board[r][c] === 0) return [r, c];
    return null;
}

// ------------------------------------------------------------
// EVENT LISTENERS
// ------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startBtn");
    const solveBtn = document.getElementById("solveBtn");
    const solverType = document.getElementById("solverType");
    const difficultySelect = document.getElementById("difficulty");

    // START GAME
    startBtn.addEventListener("click", () => {
        try {
            const difficulty = parseInt(difficultySelect.value, 10);
            initBoard();
            setGameDiff(difficulty);
            displayBoard();
            console.log("Game started - board initialized.");
        } catch (err) {
            console.error("Error initializing board:", err);
            alert("Failed to start game. See console for details.");
        }
    });

    // SOLVE GAME
    solveBtn.addEventListener("click", () => {
        try {
            // ensure board exists and has been initialized
            if (!Array.isArray(gameBoard) || gameBoard.length !== 9 || gameBoard[0].length !== 9) {
                alert("Board not initialized. Click Start Game first.");
                return;
            }

            const chosen = solverType.value;
            console.log("Solving with:", chosen);

            // Make a shallow copy? We want to solve the live board in-place:
            if (chosen === "backtracking") {
                const solved = solveBacktracking(gameBoard);
                if (!solved) {
                    alert("Backtracking solver failed to find a solution.");
                    console.warn("Backtracking failed for this board.");
                } else {
                    alert("Solved using Backtracking!");
                }
            } else if (chosen === "random") {
                const solved = solveRandom(gameBoard);
                if (!solved) {
                    alert("Random solver failed to find a solution.");
                    console.warn("Random solver failed for this board.");
                } else {
                    alert("Solved using Random Fill!");
                }
            } else {
                alert("Unknown solver selected.");
            }

            displayBoard();
        } catch (err) {
            console.error("Error while solving:", err);
            alert("An error occurred while solving. See console for details.");
        }
    });

    // Initialize a board on initial load so page doesn't look empty (optional)
    // You can comment this out if you don't want the page to auto-start a puzzle.
    initBoard();
    setGameDiff(parseInt(difficultySelect.value || "1", 10));
    displayBoard();
});
