/*
Author: Caleb Okrzesik
Date: Updated 12/04/2025
Purpose: Browser Sudoku game with solver selection (backtracking + random),
         undo support, prefilled protection, and animated step-by-step solver.
*/

let gameBoard = [];
let prefilled = [];      // boolean 9x9: true if initial cell is given and should be unchangeable
let moveHistory = [];    // stack of user moves for undo: {row, col, prev}
let selectedCell = null;
let solvingInProgress = false;

// Utility sleep for animations
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------------------- Board Generation ----------------------
function initBoard() {
    gameBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
    prefilled = Array.from({ length: 9 }, () => Array(9).fill(false));
    moveHistory = [];

    function fillCell(row, col) {
        if (row === 9) return true;
        if (col === 9) return fillCell(row + 1, 0);

        let numbers = Array.from({ length: 9 }, (_, i) => i + 1);
        // Fisher–Yates shuffle
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

// ---------------------- Difficulty (clear cells) ----------------------
function setGameDiff(difficulty) {
    // After board is filled, clear some cells and mark prefilled
    let numToClear;
    if (difficulty === 1) numToClear = 81 - (30 + Math.floor(Math.random() * 6));
    else if (difficulty === 2) numToClear = 81 - (25 + Math.floor(Math.random() * 6));
    else numToClear = 81 - (20 + Math.floor(Math.random() * 6));

    // Mark everything prefilled initially
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) prefilled[r][c] = true;

    let cleared = 0;
    while (cleared < numToClear) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        if (gameBoard[row][col] !== 0) {
            gameBoard[row][col] = 0;
            prefilled[row][col] = false; // this becomes empty and therefore changeable by user
            cleared++;
        }
    }

    // For any remaining non-cleared cells, keep them as prefilled (true).
    // Also clear moveHistory
    moveHistory = [];
}

// ---------------------- Validation ----------------------
function checkIfValid(board, row, col, num) {
    // row
    if (board[row].includes(num)) return false;
    // col
    for (let r = 0; r < 9; r++) if (board[r][col] === num) return false;
    // 3x3 box
    let startRow = Math.floor(row / 3) * 3;
    let startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++)
        for (let c = startCol; c < startCol + 3; c++)
            if (board[r][c] === num) return false;
    return true;
}

// ---------------------- Display ----------------------
function displayBoard() {
    const boardDiv = document.getElementById("sudokuBoard");
    boardDiv.innerHTML = "";

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            // Add thicker borders for 3x3 separation
            if (c % 3 === 2 && c !== 8) cell.classList.add("border-right");
            if (r % 3 === 2 && r !== 8) cell.classList.add("border-bottom");

            if (gameBoard[r][c] !== 0) {
                cell.textContent = gameBoard[r][c];
            } else {
                cell.textContent = "";
            }

            cell.dataset.row = r;
            cell.dataset.col = c;

            // Styling classes:
            if (prefilled[r][c] && gameBoard[r][c] !== 0) {
                cell.classList.add("prefilled");
            } else if (!prefilled[r][c] && gameBoard[r][c] !== 0) {
                // user filled
                cell.classList.add("userfilled");
            }

            // selection handler
            cell.addEventListener("click", () => {
                // don't allow selecting when solver running
                if (solvingInProgress) return;
                selectCell(cell);
            });

            boardDiv.appendChild(cell);
        }
    }
}

// ---------------------- User Interactions ----------------------
function selectCell(cell) {
    const row = parseInt(cell.dataset.row, 10);
    const col = parseInt(cell.dataset.col, 10);

    // cannot change prefilled (initial) cells
    if (prefilled[row][col] && gameBoard[row][col] !== 0) {
        // optional visual feedback
        alert("This cell is a starting clue and cannot be changed.");
        return;
    }

    // if currently filled by user, allow changing directly
    let current = gameBoard[row][col];

    let input = prompt("Enter a number (1-9) or leave blank to clear:", current === 0 ? "" : String(current));
    if (input === null) return; // cancelled

    input = input.trim();
    let num = input === "" ? 0 : parseInt(input, 10);
    if (num === 0) {
        // clearing cell (allowed if not prefilled)
        if (current !== 0) {
            moveHistory.push({ row, col, prev: current });
            gameBoard[row][col] = 0;
            displayBoard();
        }
        return;
    }

    if (!Number.isInteger(num) || num < 1 || num > 9) {
        alert("Please enter a valid integer between 1 and 9 (or empty to clear).");
        return;
    }

    // Validate move
    if (!checkIfValid(gameBoard, row, col, num)) {
        alert("Invalid move. Violates Sudoku rules.");
        return;
    }

    // push to history for undo
    moveHistory.push({ row, col, prev: current });
    gameBoard[row][col] = num;
    displayBoard();
}

// Undo the last user move
function undoLastMove() {
    if (solvingInProgress) {
        alert("Cannot undo while solver is running.");
        return;
    }
    if (moveHistory.length === 0) {
        alert("No moves to undo.");
        return;
    }
    const last = moveHistory.pop();
    gameBoard[last.row][last.col] = last.prev;
    displayBoard();
}

// ---------------------- Board completion check ----------------------
function isBoardComplete() {
    return gameBoard.every(row => row.every(cell => cell !== 0));
}

// ---------------------- Solver Utilities ----------------------
function findEmpty(board) {
    for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++)
            if (board[r][c] === 0) return [r, c];
    return null;
}

// A safe clone (not used for animated in-place solving but useful)
function cloneBoard(board) {
    return board.map(row => row.slice());
}

// ---------------------- Solvers (non-animated) ----------------------
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

// ---------------------- Animated Solvers ----------------------
// These modify the board in-place and call displayBoard so the user sees the steps.
// Delay is in ms.

async function solveBacktrackingAnimated(board, delay) {
    const empty = findEmpty(board);
    if (!empty) return true;
    const [row, col] = empty;

    for (let num = 1; num <= 9; num++) {
        if (checkIfValid(board, row, col, num)) {
            board[row][col] = num;
            displayBoard();        // show attempt
            await sleep(delay);

            if (await solveBacktrackingAnimated(board, delay)) return true;

            // backtrack
            board[row][col] = 0;
            displayBoard();
            await sleep(delay);
        }
    }
    return false;
}

async function solveRandomAnimated(board, delay) {
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
            displayBoard();
            await sleep(delay);
            if (await solveRandomAnimated(board, delay)) return true;
            board[row][col] = 0;
            displayBoard();
            await sleep(delay);
        }
    }
    return false;
}

// ---------------------- UI Helpers ----------------------
function setControlsEnabled(enabled) {
    document.getElementById("startBtn").disabled = !enabled;
    document.getElementById("solveBtn").disabled = !enabled;
    document.getElementById("undoBtn").disabled = !enabled;
    document.getElementById("difficulty").disabled = !enabled;
    document.getElementById("solverType").disabled = !enabled;
    document.getElementById("animateCheckbox").disabled = !enabled;
    document.getElementById("speedRange").disabled = !enabled;
}

// ---------------------- Event binding ----------------------
window.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startBtn");
    const solveBtn = document.getElementById("solveBtn");
    const undoBtn = document.getElementById("undoBtn");
    const solverType = document.getElementById("solverType");
    const difficultySelect = document.getElementById("difficulty");
    const animateCheckbox = document.getElementById("animateCheckbox");
    const speedRange = document.getElementById("speedRange");
    const speedValue = document.getElementById("speedValue");

    speedRange.addEventListener("input", () => {
        speedValue.textContent = `${speedRange.value}ms`;
    });

    startBtn.addEventListener("click", () => {
        initBoard();
        setGameDiff(parseInt(difficultySelect.value, 10));
        displayBoard();
    });

    undoBtn.addEventListener("click", () => undoLastMove());

    solveBtn.addEventListener("click", async () => {
        if (solvingInProgress) return;

        // require board be initialized
        if (!Array.isArray(gameBoard) || gameBoard.length !== 9) {
            alert("Please start a game first.");
            return;
        }

        const animate = animateCheckbox.checked;
        const delay = parseInt(speedRange.value, 10) || 150;
        const chosen = solverType.value;

        if (!animate) {
            // Non-animated solve (immediate)
            const boardCopy = cloneBoard(gameBoard); // we will try to solve in-place
            let solved;
            if (chosen === "backtracking") solved = solveBacktracking(boardCopy);
            else solved = solveRandom(boardCopy);

            if (!solved) {
                alert("Solver failed to find a solution.");
                return;
            }

            // copy solved board back to gameBoard but DO NOT overwrite prefilled positions
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (!prefilled[r][c]) gameBoard[r][c] = boardCopy[r][c];
                }
            }
            displayBoard();
            alert(`Solved using ${chosen === "backtracking" ? "Backtracking" : "Random Fill"}!`);
            return;
        }

        // Animated solve
        setControlsEnabled(false);
        solvingInProgress = true;

        // Work on live board but preserve prefilled (solvers operate on zeros)
        let solvedAnimated = false;
        try {
            if (chosen === "backtracking") {
                solvedAnimated = await solveBacktrackingAnimated(gameBoard, delay);
            } else {
                solvedAnimated = await solveRandomAnimated(gameBoard, delay);
            }
        } catch (err) {
            console.error("Error during animated solve:", err);
        }

        solvingInProgress = false;
        setControlsEnabled(true);

        if (!solvedAnimated) {
            alert("Animated solver failed to find a solution.");
        } else {
            alert("Animated solve complete!");
        }
    });

    // create an initial board on load so the page isn't blank
    initBoard();
    setGameDiff(parseInt(difficultySelect.value, 10));
    displayBoard();
});
