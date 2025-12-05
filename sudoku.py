# sudoku.py
# Author: Caleb Okrzesik
# Purpose: Main Sudoku game + optional solver

import random
from solver_method import choose_solver


def main():
    # setup
    gameBoard = [[0 for _ in range(9)] for _ in range(9)]
    gameBoard = initBoard(gameBoard)
    displayBoard(gameBoard)

    difficulty = int(input("Difficulty (1 easy, 2 medium, 3 hard): "))
    setGameDiff(gameBoard, difficulty)

    print("Initial Puzzle:")
    displayBoard(gameBoard)

    # solver option
    use_solver = input("Use auto-solver? (y/n): ").lower()
    if use_solver == "y":
        choose_solver(gameBoard)
        print("Solved Board:")
        displayBoard(gameBoard)
        return

    # manual play
    while True:
        if all(all(cell != 0 for cell in row) for row in gameBoard):
            print("Congratulations! You completed the Sudoku board!")
            break

        try:
            row = int(input("Enter row (0-8): "))
            col = int(input("Enter column (0-8): "))
            num = int(input("Enter number (1-9): "))
        except ValueError:
            print("Invalid input. Integers only.")
            continue

        if placeNumber(gameBoard, row, col, num):
            displayBoard(gameBoard)
        else:
            print("Try again.")


def placeNumber(board, row, col, num):
    if not (0 <= row <= 8 and 0 <= col <= 8):
        print("Invalid row/column.")
        return False
    if board[row][col] != 0:
        print("Cell already filled.")
        return False
    if not checkIfValid(board, row, col, num):
        print("Illegal Sudoku move.")
        return False

    board[row][col] = num
    return True


def setGameDiff(gameBoard, difficulty):
    if difficulty == 1:
        numToClear = 81 - random.randint(30, 35)
    elif difficulty == 2:
        numToClear = 81 - random.randint(25, 30)
    else:
        numToClear = 81 - random.randint(20, 25)

    cleared = 0
    while cleared < numToClear:
        row = random.randint(0, 8)
        col = random.randint(0, 8)
        if gameBoard[row][col] != 0:
            gameBoard[row][col] = 0
            cleared += 1


def initBoard(gameBoard):
    def fillCell(row, col):
        if row == 9:
            return True
        if col == 9:
            return fillCell(row + 1, 0)

        numbers = list(range(1, 10))
        random.shuffle(numbers)

        for num in numbers:
            if checkIfValid(gameBoard, row, col, num):
                gameBoard[row][col] = num
                if fillCell(row, col + 1):
                    return True
                gameBoard[row][col] = 0
        return False

    fillCell(0, 0)
    return gameBoard


def checkIfValid(board, row, col, num):
    if num in board[row]:
        return False

    for r in range(9):
        if board[r][col] == num:
            return False

    startRow = (row // 3) * 3
    startCol = (col // 3) * 3
    for r in range(startRow, startRow + 3):
        for c in range(startCol, startCol + 3):
            if board[r][c] == num:
                return False
    return True


def displayBoard(gameBoard):
    print("-------------------------------------------")
    for row in gameBoard:
        for item in row:
            print(item, "| ", end="")
        print("\n-------------------------------------------")


if __name__ == "__main__":
    main()
