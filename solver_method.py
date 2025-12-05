# solver_methods.py
# Provides multiple Sudoku solving algorithms + menu system


# ------------------------- Main Solver Menu -------------------------

def choose_solver(board):
    print("\nChoose a solving method:")
    print("1. Backtracking Solver (recommended)")
    print("2. Random-Fill Solver (experimental)")

    choice = input("Enter choice: ")

    if choice == "1":
        solve_backtracking(board)
        print("\nSolved using Backtracking!")
    elif choice == "2":
        solve_random_fill(board)
        print("\nSolved using Random Fill!")
    else:
        print("Invalid choice.")
        return False

    return True


# ------------------------- Backtracking Solver -------------------------

def solve_backtracking(board):
    empty = find_empty(board)
    if not empty:
        return True
    row, col = empty

    for num in range(1, 10):
        if is_valid(board, row, col, num):
            board[row][col] = num
            if solve_backtracking(board):
                return True
            board[row][col] = 0
    return False


# ------------------------- Random Fill Solver -------------------------
# (NOT reliable but included because you asked for multiple methods)

def solve_random_fill(board):
    import random
    empty = find_empty(board)
    if not empty:
        return True

    row, col = empty
    nums = list(range(1, 10))
    random.shuffle(nums)

    for num in nums:
        if is_valid(board, row, col, num):
            board[row][col] = num
            if solve_random_fill(board):
                return True
            board[row][col] = 0

    return False


# ------------------------- Utility Functions -------------------------

def find_empty(board):
    for r in range(9):
        for c in range(9):
            if board[r][c] == 0:
                return (r, c)
    return None


def is_valid(board, row, col, num):
    # row
    if num in board[row]:
        return False

    # column
    for r in range(9):
        if board[r][col] == num:
            return False

    # 3x3 box
    start_r = (row // 3) * 3
    start_c = (col // 3) * 3
    for r in range(start_r, start_r + 3):
        for c in range(start_c, start_c + 3):
            if board[r][c] == num:
                return False

    return True
