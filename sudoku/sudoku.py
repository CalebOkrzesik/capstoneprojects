# Author: Caleb Okrzesik
# 10/27/2025
# Purpose: To allows user to run and play sudko
import random

def main():
    #setup
    gameBoard = [[0 for _ in range(9)] for _ in range(9)] #Setups up board with random numbers
    gameBoard = initBoard(gameBoard) #Intialize Game Board number and remove for setup
    displayBoard(gameBoard)
    difficulty = int(input("Difficulty(1 easy, 2 medium , 3 hard): "))
    setGameDiff(gameBoard,difficulty)

    #game begin
    displayBoard(gameBoard)

    # game loop
    while True:
        # check if board is complete
        if all(all(cell != 0 for cell in row) for row in gameBoard):
            print("Congratulations! You completed the Sudoku board!")
            break

        # get user input
        try:
            row = int(input("Enter row (0-8): "))
            col = int(input("Enter column (0-8): "))
            num = int(input("Enter number (1-9): "))
        except ValueError:
            print("Invalid input. Enter integers only.")
            continue

        # attempt to place number
        if placeNumber(gameBoard, row, col, num):
            displayBoard(gameBoard)  # show updated board
        else:
            print("Try again.")



"""
Place a number on the Sudoku board if the move is valid
"""
def placeNumber(board, row, col, num):
    # Check if the row, column, and number are valid
    if row < 0 or row > 8 or col < 0 or col > 8:
        print("Invalid row or column. Must be 0-8.")
        return False

    # Check if the cell is empty
    if board[row][col] != 0:
        print("Cell already filled. Choose an empty cell.")
        return False

    # Check if the number can be placed here according to Sudoku rules
    if not checkIfValid(board, row, col, num):
        print(f"Cannot place {num} at ({row}, {col}) – violates Sudoku rules.")
        return False

    # Place the number
    board[row][col] = num
    return True  # Indicate successful placement


"""
Set game diffiuclty by clearing spaces
"""
def setGameDiff(gameBoard, difficulty):
    if difficulty == 1:  # If easy 30-35 squares out the 81 squares
        numToClear = 81 - random.randint(30, 35)
    elif difficulty == 2:  # If medium 25-30 squares
        numToClear = 81 - random.randint(25, 30)
    else:  # If hard 20-25 squares
        numToClear = 81 - random.randint(20, 25)

    cleared = 0
    while cleared < numToClear:
        row = random.randint(0, 8)  # pick a random row
        col = random.randint(0, 8)  # pick a random column
        if gameBoard[row][col] != 0:  # only clear if not already 0
            gameBoard[row][col] = 0  # reset current cell to 0
            cleared += 1

"""
Set up the iniital game board
"""
def initBoard(gameBoard):
    # Recursive helper function
    def fillCell(row, col):
        if row == 9:  # all rows filled
            return True
        if col == 9:  # move to next row
            return fillCell(row + 1, 0)

        numbers = list(range(1, 10))  # generates numbers 1–9
        random.shuffle(numbers)  # shuffle them randomly

        for num in numbers:
            if checkIfValid(gameBoard, row, col, num):  # check to see if number has been used already
                gameBoard[row][col] = num  # sets game board square to number
                if fillCell(row, col + 1):  # move to next cell
                    return True
                gameBoard[row][col] = 0  # backtrack if stuck
        return False  # trigger backtracking

    fillCell(0, 0)
    return gameBoard

"""
Checks for value existign already if it does return false
"""
def checkIfValid(board, row, col, num):
    # Check if the number already exists in the current row
    if num in board[row]:
        return False  # Number already in row, cannot place here

    # Check if the number already exists in the current column
    for r in range(9):  # Iterate through all rows in this column
        if board[r][col] == num:
            return False

    # Check if the number exists in the 3x3
    startRow, startCol = (row // 3) * 3, (col // 3) * 3  # Find top left corner
    for r in range(startRow, startRow + 3):  # Iterate through rows
        for c in range(startCol, startCol + 3):  # Iterate through columns
            if board[r][c] == num:
                return False

    return True


"""
Displays Game Board
"""
def displayBoard(gameBoard):
    print("-------------------------------------------")
    for row in gameBoard:
        current = 9
        for item in row:
            print(item, "|"," ", end="")
            current -= 1
            if current == 0:
                print("\n",end="")
        print("-------------------------------------------")

main()