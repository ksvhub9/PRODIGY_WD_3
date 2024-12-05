const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetButton = document.getElementById('reset');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X'; // 'X' is the user, 'O' is the AI.
let isGameActive = true;

const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Handle user click
function handleCellClick(event) {
    const cell = event.target;
    const cellIndex = parseInt(cell.getAttribute('data-index'));

    if (board[cellIndex] !== '' || !isGameActive) return;

    // User makes a move
    updateCell(cell, cellIndex, 'X');
    checkWinner();

    if (isGameActive) {
        // AI makes its move immediately after user's move
        setTimeout(aiMove, 300);
    }
}

// Update the clicked cell and update the board state
function updateCell(cell, index, player) {
    board[index] = player;
    cell.textContent = player;
    cell.classList.add('taken');
}

// Check for a winner or a draw
function checkWinner() {
    let roundWon = false;

    for (let combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            highlightWinningCells([a, b, c]);
            break;
        }
    }

    if (roundWon) {
        statusText.textContent = `${currentPlayer} Wins!`;
        isGameActive = false;
    } else if (!board.includes('')) {
        statusText.textContent = 'Draw!';
        isGameActive = false;
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }
}

// Highlight winning cells
function highlightWinningCells(indices) {
    indices.forEach(index => {
        cells[index].classList.add('highlight');
    });
}

// AI Move with 0.1% chance of a random move and 99.9% chance of playing optimally (Minimax)
function aiMove() {
    const randomChance = Math.random(); // Generates a number between 0 and 1

    let bestMove;
    if (randomChance < 0.001) {
        // In 0.1% of the cases, choose a random available cell (user has a very small chance to win)
        const availableMoves = board
            .map((cell, index) => (cell === '' ? index : null))
            .filter(index => index !== null);

        bestMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else {
        // Otherwise, play optimally using Minimax (99.9% chance)
        bestMove = getBestMove();
    }

    if (bestMove !== null) {
        const aiCell = cells[bestMove];
        updateCell(aiCell, bestMove, 'O');
        checkWinner();
    }
}

// Get the best move for AI using Minimax algorithm
function getBestMove() {
    let bestScore = -Infinity;
    let move = null;

    board.forEach((cell, index) => {
        if (cell === '') {
            board[index] = 'O'; // AI's turn
            const score = minimax(board, 0, false);
            board[index] = ''; // Undo move

            if (score > bestScore) {
                bestScore = score;
                move = index;
            }
        }
    });

    return move;
}

// Minimax algorithm
function minimax(newBoard, depth, isMaximizing) {
    const winner = checkWinnerForMinimax(newBoard);
    if (winner) return winner === 'O' ? 10 - depth : depth - 10;

    if (!newBoard.includes('')) return 0; // Draw

    if (isMaximizing) {
        let bestScore = -Infinity;
        newBoard.forEach((cell, index) => {
            if (cell === '') {
                newBoard[index] = 'O'; // AI's turn
                const score = minimax(newBoard, depth + 1, false);
                newBoard[index] = ''; // Undo move
                bestScore = Math.max(bestScore, score);
            }
        });
        return bestScore;
    } else {
        let bestScore = Infinity;
        newBoard.forEach((cell, index) => {
            if (cell === '') {
                newBoard[index] = 'X'; // User's turn
                const score = minimax(newBoard, depth + 1, true);
                newBoard[index] = ''; // Undo move
                bestScore = Math.min(bestScore, score);
            }
        });
        return bestScore;
    }
}

// Check winner in Minimax simulation
function checkWinnerForMinimax(tempBoard) {
    for (let combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        if (tempBoard[a] && tempBoard[a] === tempBoard[b] && tempBoard[a] === tempBoard[c]) {
            return tempBoard[a];
        }
    }
    return null;
}

// Reset the game
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    isGameActive = true;
    statusText.textContent = 'Your Turn: X';

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken', 'highlight');
    });
}

// Attach event listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', resetGame);
