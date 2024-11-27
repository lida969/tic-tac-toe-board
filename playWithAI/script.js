import { saveGame, loadGame } from '../jsonbin.js'; // Импорт функций

let currentPlayer = 'Player 2';
let gameBoard = [];
let gameActive = true;
let player1Wins = 0;
let player2Wins = 0;
let winMode = 1; // Default to "first to 1 win"
let boardSize = 3; // Default board size is 3x3

// Получаем ссылки на элементы
const winModeSelect = document.getElementById('winMode');
const boardSizeSelect = document.getElementById('boardSize');
const resetButton = document.getElementById('resetButton');
const messageElement = document.getElementById('gameMessage');
const player1WinsElement = document.getElementById('player1Wins');
const player2WinsElement = document.getElementById('player2Wins');
const toggleThemeButton = document.getElementById('toggleTheme');
const tournamentModeToggle = document.getElementById('tournamentModeToggle');
const boardElement = document.getElementById('tic-tac-toe-board');
let isPlayer1Turn = true; // Переменная для отслеживания первого хода (по умолчанию игрок 1)

let aiLevel = "random"; // Уровень ИИ: random, hard (Minimax)

// Выбор режима победы
winModeSelect.addEventListener('change', (event) => {
  winMode = parseInt(event.target.value);
  player1Wins = 0;
  player2Wins = 0;
  player1WinsElement.innerText = player1Wins;
  player2WinsElement.innerText = player2Wins;
  resetGamebutton(); // Сбрасываем игру при изменении режима побед
});
// Кнопка "Reset"
resetButton.addEventListener('click', () => {
  player1Wins = 0;
  player2Wins = 0;
  player1WinsElement.innerText = player1Wins;
  player2WinsElement.innerText = player2Wins;
  resetGamebutton();
});
// Изменение размера поля
boardSizeSelect.addEventListener('change', (event) => {
  boardSize = parseInt(event.target.value);
  player1Wins = 0;
  player2Wins = 0;
  player1WinsElement.innerText = player1Wins;
  player2WinsElement.innerText = player2Wins;
  createBoard();
  resetGamebutton();
});

function setAILevel(level) {
  aiLevel = level;
  resetGamebutton(); // Сбрасываем игру при смене уровня

  // Обновляем подсветку кнопок
  const buttons = document.querySelectorAll('#aiLevelSettings button');
  buttons.forEach(button => button.classList.remove('active')); // Убираем подсветку со всех кнопок
  document.querySelector(`#aiLevelSettings button[data-level="${level}"]`).classList.add('active'); // Подсвечиваем выбранную
}

function makeAIMove() {
    if (!gameActive || currentPlayer !== 'Player 2') return;

    const availableCells = gameBoard
        .map((value, index) => (value === '' ? index : null))
        .filter(index => index !== null);

    if (availableCells.length === 0) return;

    if (aiLevel === "random") {
        // Рандомный выбор клетки
        const randomIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
        gameBoard[randomIndex] = 'O'; // Ход ИИ
    } else if (aiLevel === "hard") {
        // Используем алгоритм Minimax
        const bestMove = minimaxAlphaBeta(gameBoard, 'O').index;
        gameBoard[bestMove] = 'O'; // Ход ИИ
    }

    updateUI();
    checkForWinOrDraw('Player 2'); // Проверяем победу или ничью

    if (gameActive) {
        currentPlayer = 'Player 1'; // Передача хода игроку
    }
}

// Алгоритм Minimax
function minimaxAlphaBeta(board, player, alpha, beta, depth = 0, maxDepth = 4) {
  const availSpots = board
      .map((value, index) => (value === '' ? index : null))
      .filter(index => index !== null);

  if (checkImmediateWin(board, 'O')) return { score: 10 - depth };
  if (checkImmediateWin(board, 'X')) return { score: depth - 10 };
  if (availSpots.length === 0 || depth >= maxDepth) {
      return { score: heuristicEvaluation(board, player) };
  }

  const moves = [];
  let bestMove = null;

  for (let i = 0; i < availSpots.length; i++) {
      const move = {};
      move.index = availSpots[i];
      board[availSpots[i]] = player;

      let result;
      if (player === 'O') {
          result = minimaxAlphaBeta(board, 'X', alpha, beta, depth + 1, maxDepth);
          move.score = result.score;
          alpha = Math.max(alpha, move.score);
      } else {
          result = minimaxAlphaBeta(board, 'O', alpha, beta, depth + 1, maxDepth);
          move.score = result.score;
          beta = Math.min(beta, move.score);
      }

      board[availSpots[i]] = ''; // Отменяем ход
      moves.push(move);

      if (beta <= alpha) break; // Отсечение
  }

  if (player === 'O') {
      bestMove = moves.reduce((best, move) => (move.score > best.score ? move : best), { score: -Infinity });
  } else {
      bestMove = moves.reduce((best, move) => (move.score < best.score ? move : best), { score: Infinity });
  }

  return bestMove;
}

function heuristicEvaluation(board, player) {
  let score = 0;

  const winConditions = generateWinConditions();

  for (let condition of winConditions) {
      const playerCount = condition.filter(index => board[index] === player).length;
      const opponentCount = condition.filter(index => board[index] === (player === 'O' ? 'X' : 'O')).length;

      if (playerCount > 0 && opponentCount === 0) {
          score += Math.pow(10, playerCount); // Чем больше фигур игрока, тем выше оценка
      } else if (opponentCount > 0 && playerCount === 0) {
          score -= Math.pow(10, opponentCount); // Уменьшайте оценку за фигуры противника
      }
  }

  return score;
}


function createBoard() {
  boardElement.innerHTML = ''; // Очищаем текущее поле

  // Устанавливаем адаптивные размеры сетки
  boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
  boardElement.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;

   while (gameBoard.length < boardSize * boardSize) {
    gameBoard = Array(boardSize * boardSize).fill('');
  }

  for (let i = 0; i < boardSize * boardSize; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');

    // Добавляем уникальный ID для каждой ячейки
    cell.id = `cell-${i + 1}`;
    cell.innerText = gameBoard[i];
    // Добавляем обработчик кликов
    cell.addEventListener('click', cellClicked);
    
    // Добавляем ячейку в поле
    boardElement.appendChild(cell);
  }

  // Адаптируем размеры ячеек
  resizeBoard();
}
function resizeBoard() {
  const boardWidth = Math.min(window.innerWidth, window.innerHeight) * 0.9; // Размер поля 90% от меньшей стороны экрана
  boardElement.style.width = `${boardWidth}px`;
  boardElement.style.height = `${boardWidth}px`;
}
window.addEventListener('resize', resizeBoard);


function handlePlayerTurn(clickedCellIndex) {
  if (gameBoard[clickedCellIndex] !== '' || !gameActive) {
    return;
  }

  // Сохранение хода игрока
  const symbol = currentPlayer === 'Player 1' ? 'X' : 'O';
  gameBoard[clickedCellIndex] = symbol;

  checkForWinOrDraw(); // Проверка условий победы/ничьей
  updateUI(); // Обновление UI после проверки
  currentPlayer = currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1'; 
  if (currentPlayer == 'Player 2'){
    setTimeout(makeAIMove, 500);
  } // Переключение игрока
}

function cellClicked(clickedCellEvent) {
  const clickedCell = clickedCellEvent.target;
  const clickedCellIndex = parseInt(clickedCell.id.replace('cell-', '')) - 1;

  if (gameBoard[clickedCellIndex] !== '' || !gameActive) return;

  const symbol = currentPlayer === 'Player 1' ? 'X' : 'O';
  gameBoard[clickedCellIndex] = symbol;
  checkForWinOrDraw();
  currentPlayer = currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1';
  if (currentPlayer == 'Player 2'){
    setTimeout(makeAIMove, 500);
  } 
  updateUI();
  saveGame({
    gameBoard,
    currentPlayer,
    player1Wins,
    player2Wins,
    winMode,
    boardSize,
    isTournamentMode: tournamentModeToggle.checked,
  });
}
function updateUI() {
  const cells = document.querySelectorAll('.cell');
  for (let i = 0; i < boardSize * boardSize; i++) {
    cells[i].innerText = gameBoard[i];
  }

  // Обновление сообщения о текущем игроке
  const currentPlayerDisplay = document.getElementById('currentPlayerDisplay');
  currentPlayerDisplay.innerText = `Current Player: ${currentPlayer}`;
}
// Проверка на победу или ничью

function checkForWinOrDraw() {
  let roundWon = false;

  const winConditions = generateWinConditions();
  const currentSymbol = currentPlayer === 'Player 1' ? 'X' : 'O'; // Символ текущего игрока

  // Проверка условий победы
  for (let condition of winConditions) {
      if (condition.every(index => gameBoard[index] === currentSymbol)) {
          roundWon = true;
          break;
      }
  }

  if (roundWon) {
      announceWinner(currentPlayer); // Объявляем победителя
      gameActive = false;
      return;
  }

  // Проверка на ничью: если нет доступных ходов и никто не может победить
  if (!gameBoard.includes('') && !canWin('X', gameBoard) && !canWin('O', gameBoard)) {
      announceDraw();
  }
}

/// Генерация условий победы
function generateWinConditions() {
  const conditions = [];

  // Горизонтальные линии
  for (let row = 0; row < boardSize; row++) {
    const start = row * boardSize;
    conditions.push(Array.from({ length: boardSize }, (_, i) => start + i));
  }

  // Вертикальные линии
  for (let col = 0; col < boardSize; col++) {
    conditions.push(Array.from({ length: boardSize }, (_, i) => col + i * boardSize));
  }

  // Диагонали
  conditions.push(Array.from({ length: boardSize }, (_, i) => i * (boardSize + 1)));
  conditions.push(Array.from({ length: boardSize }, (_, i) => (i + 1) * (boardSize - 1)));

  return conditions;
}

function isDrawPredicted() {
  // Если уже есть победитель или поле полностью заполнено
  if (checkImmediateWin() || !gameBoard.includes('')) {
    return false;
  }

  // Запускаем проверку для текущей позиции
  return !canWin(currentPlayer, gameBoard);
}

function canWin(player, board) {
  const winConditions = generateWinConditions();

  for (let condition of winConditions) {
      const hasPotential = condition.every(index => 
          board[index] === player || board[index] === '' // Проверка доступности для победы
      );

      if (hasPotential) {
          const tempBoard = [...board];
          for (let index of condition) {
              if (tempBoard[index] === '') tempBoard[index] = player; // Пробуем поставить символ
          }

          if (checkImmediateWin(tempBoard)) return true;
      }
  }

  return false;
}
function checkImmediateWin(board = gameBoard) {
  const winConditions = generateWinConditions();

  for (let condition of winConditions) {
    if (condition.every(index => board[index] === currentPlayer)) {
      return true;
    }
  }
  return false;
}
function announceWinner(player) {
  messageElement.innerText = `${player} Wins!`;

  if (player === 'Player 1') {
    player1Wins++;
    player1WinsElement.innerText = player1Wins;
  } else {
    player2Wins++;
    player2WinsElement.innerText = player2Wins;
  }

  // Если один из игроков достиг победного счета в турнире
  if (player1Wins >= winMode || player2Wins >= winMode) {
    // Показываем окно с результатами
    showTournamentResult(player);
    gameActive = false;
  } else {
    setTimeout(() => {
      resetGamebutton();
      // Обнуляем состояние игры
      gameBoard = Array(boardSize * boardSize).fill('');
      saveGame({
        gameBoard,
        currentPlayer,
        player1Wins,
        player2Wins,
        winMode,
        boardSize,
        isTournamentMode: tournamentModeToggle.checked,
      });
    }, 2000);
  };
}

function showTournamentResult(winner) {
  // Обновляем текст в модальном окне
  const isTournamentMode = tournamentModeToggle.checked; // галочка для режима турнира

  if (isTournamentMode) {
    const tournamentWinner = document.getElementById('tournamentWinner');
    const tournamentScore = document.getElementById('tournamentScore');
    
    tournamentWinner.innerText = `Победил ${winner}`;
    tournamentScore.innerText = `Счет: ${player1Wins}:${player2Wins}`;

    // Показываем модальное окно
    document.getElementById('tournamentResultModal').style.display = 'flex';
  } else {
    setTimeout(() => resetGamebutton(), 2000);
  }
  const closeModalButton = document.getElementById('closeModalButton');
  if (closeModalButton) {
        closeModalButton.addEventListener('click', closeTournamentResult);
  };
}

function closeTournamentResult() {
  // Закрываем модальное окно
  document.getElementById('tournamentResultModal').style.display = 'none';

  // Сбрасываем игру и счетчики
  player1Wins = 0;
  player2Wins = 0;
  player1WinsElement.innerText = player1Wins;
  player2WinsElement.innerText = player2Wins;

  resetGamebutton(); // Сброс игры для новой серии
  saveGame({
   gameBoard,
   currentPlayer,
   player1Wins,
   player2Wins,
   winMode,
   boardSize,
   isTournamentMode: tournamentModeToggle.checked,
  }); // Сброс игры для новой серии
}

// Объявление ничьей
// Объявление ничьей
function announceDraw() {
  messageElement.innerText = 'Game Draw!';
  gameActive = false;

  setTimeout(() => resetGamebutton(), 2000);
  saveGame({
    gameBoard,
    currentPlayer,
    player1Wins,
    player2Wins,
    winMode,
    boardSize,
    isTournamentMode: tournamentModeToggle.checked,
  });
}

tournamentModeToggle.addEventListener('change', (event) => {
  toggleTournamentMode(event.target.checked);
});

function toggleTournamentMode(isTournamentMode) {
  const scoreElements = document.getElementById('scoreSection');
  const tournamentSettings = document.getElementById('tournamentSettings');

  if (isTournamentMode) {
    // Показать настройки турнира и счётчики
    scoreElements.style.display = 'block';
    tournamentSettings.style.display = 'block';
    
  } else {
    // Скрыть настройки турнира и счётчики
    scoreElements.style.display = 'none';
    tournamentSettings.style.display = 'none';

    // Скрыть счётчики и сбросить их
    scoreElements.style.display = 'none';
    player1Wins = 0;
    player2Wins = 0;
    player1WinsElement.innerText = player1Wins;
    player2WinsElement.innerText = player2Wins;

    // Сбросить режим до 1 победы
    winMode = 1;
    winModeSelect.value = winMode;
  }
  createBoard()
  saveGame({
    gameBoard,
    currentPlayer,
    player1Wins,
    player2Wins,
    winMode,
    boardSize,
    isTournamentMode: tournamentModeToggle.checked,
  });
}
function resetGame() {
  // Переключаем, кто будет делать первый ход

  
  //gameBoard.fill('');
  gameActive = true;
  updateUI(); // Обновление интерфейса
  messageElement.innerText = '';
  if (currentPlayer === 'Player 2') {
    setTimeout(makeAIMove, 500);
  }
  saveGame({
    gameBoard,
    currentPlayer,
    player1Wins,
    player2Wins,
    winMode,
    boardSize,
    isTournamentMode: tournamentModeToggle.checked,
  });
}
// Инициализация игры
async function initializeGame() {
  winMode = 1; // Сбрасываем режим победы на "до 1 победы"
  winModeSelect.value = winMode; // Устанавливаем значение в выпадающем списке
  boardSize = 3; // Устанавливаем размер поля по умолчанию
  boardSizeSelect.value = boardSize; // Устанавливаем размер в выпадающем списке
  tournamentModeToggle.checked = false; // Выключаем режим турнира по умолчанию
  const savedGameData = await loadGame();
  console.log('Loaded game data:', savedGameData);
  if (savedGameData) {
    // Восстановите данные из сохранённого состояния
    gameBoard = savedGameData.gameBoard || Array(boardSize * boardSize).fill('');
    currentPlayer = savedGameData.currentPlayer || 'Player 1';
    player1Wins = savedGameData.player1Wins || 0;
    player2Wins = savedGameData.player2Wins || 0;
    boardSize = savedGameData.boardSize || 3;
    winMode = savedGameData.winMode || 1;
    const isTournamentMode = savedGameData.isTournamentMode || false;
    tournamentModeToggle.checked = isTournamentMode;
    // Обновляем интерфейс
    winModeSelect.value = winMode;
    boardSizeSelect.value = boardSize;
    player1WinsElement.innerText = player1Wins;
    player2WinsElement.innerText = player2Wins;
    toggleTournamentMode(isTournamentMode);
  }
  else {
    // Если нет сохраненных данных, инициализируем начальные значения
    player1Wins = 0;
    player2Wins = 0;
    player1WinsElement.innerText = player1Wins;
    player2WinsElement.innerText = player2Wins;
    toggleTournamentMode(false);
    gameBoard = Array(boardSize * boardSize).fill('');
  }

  createBoard();
  resetGame();
}

function resetGamebutton() {
  isPlayer1Turn = !isPlayer1Turn;
  currentPlayer = isPlayer1Turn ? 'Player 1' : 'Player 2';
  
  gameBoard = Array(boardSize * boardSize).fill('');
  gameActive = true;
  messageElement.innerText = '';
  const isTournamentMode = tournamentModeToggle.checked;
  createBoard(); // Пересоздайте игровое поле
  updateUI(); 
  if (currentPlayer === 'Player 2') {
    setTimeout(makeAIMove, 500);
  }
  saveGame({
    gameBoard,
    currentPlayer,
    player1Wins,
    player2Wins,
    winMode,
    boardSize,
    isTournamentMode: tournamentModeToggle.checked,
  });
   if (!isTournamentMode) {
    player1Wins = 0;
    player2Wins = 0;
    player1WinsElement.innerText = player1Wins;
    player2WinsElement.innerText = player2Wins;
   }
}
// Переключение темы
toggleThemeButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
});


initializeGame();
