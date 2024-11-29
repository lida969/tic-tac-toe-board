import { saveGame, loadGame } from '../jsonbin.js'; // Импорт функций

let currentPlayer = 'Player 2'; // Переменная для отслеживания текущего игрока
let gameBoard = []; // Массив для хранения состояния игрового поля
let gameActive = true; // Флаг для состояния игры
let player1Wins = 0; // Счёт побед игрока 1
let player2Wins = 0; // Счёт побед игрока 2
let winMode = 1; // Режим победы (по умолчанию "до 1 победы")
let boardSize = 3; // Размер игрового поля (по умолчанию 3x3)

// Получение ссылок на элементы управления
const winModeSelect = document.getElementById('winMode');  // Элемент выбора режима победы
const boardSizeSelect = document.getElementById('boardSize'); // Элемент выбора размера поля
const resetButton = document.getElementById('resetButton'); // Кнопка сброса игры
const messageElement = document.getElementById('gameMessage'); // Элемент для отображения сообщений
const player1WinsElement = document.getElementById('player1Wins'); // Элемент для счёта игрока 1
const player2WinsElement = document.getElementById('player2Wins'); // Элемент для счёта игрока 2
const toggleThemeButton = document.getElementById('toggleTheme'); // Кнопка переключения темы
const tournamentModeToggle = document.getElementById('tournamentModeToggle'); // Переключатель режима турнира
const boardElement = document.getElementById('tic-tac-toe-board'); // Элемент игрового поля
let isPlayer1Turn = true; // Переменная для отслеживания первого хода (по умолчанию игрок 1)

let aiLevel = "random"; // Уровень ИИ: random, hard (Minimax)

// Обработчик изменения режима победы
winModeSelect.addEventListener('change', (event) => {
  winMode = parseInt(event.target.value); // Устанавливается новый режим победы
  player1Wins = 0;
  player2Wins = 0;
  player1WinsElement.innerText = player1Wins;
  player2WinsElement.innerText = player2Wins;
  resetGamebutton(); // Перезапуск игры
});
// Обработчик кнопки сброса
resetButton.addEventListener('click', () => {
  player1Wins = 0;
  player2Wins = 0;
  player1WinsElement.innerText = player1Wins;
  player2WinsElement.innerText = player2Wins;
  resetGamebutton();
});
// Обработчик изменения размера игрового поля
boardSizeSelect.addEventListener('change', (event) => {
  boardSize = parseInt(event.target.value);
  player1Wins = 0;
  player2Wins = 0;
  player1WinsElement.innerText = player1Wins;
  player2WinsElement.innerText = player2Wins;
  createBoard();
  resetGamebutton();
});
// Получение ссылок на кнопки управления ИИ
const randomAIButton = document.getElementById('randomAIButton');
const hardAIButton = document.getElementById('hardAIButton');

// Добавление обработчиков для выбора уровня ИИ
randomAIButton.addEventListener('click', () => setAILevel('random')); // Вызыв setAILevel при клике на randomAIButton
hardAIButton.addEventListener('click', () => setAILevel('hard'));   // Вызыв setAILevel при клике на hardAIButton

function setAILevel(level) {
  aiLevel = level; // Устанавливается уровень ИИ
  resetGamebutton(); // Сбрас

  // Обновляем подсветку кнопок
  randomAIButton.classList.remove('active');
  hardAIButton.classList.remove('active');

  if (level === 'random') {
    randomAIButton.classList.add('active'); 
  } else if (level === 'hard') {
    hardAIButton.classList.add('active'); 
  }
}

// Функция хода ИИ
function makeAIMove() {
    if (!gameActive || currentPlayer !== 'Player 2') return; // Проверка состояния игры и очередности хода
// Поиск доступных клеток для хода
    const availableCells = gameBoard
        .map((value, index) => (value === '' ? index : null))
        .filter(index => index !== null);

    if (availableCells.length === 0) return; // Завершение, если нет доступных клеток
    console.log('aiLevel',  aiLevel); 
    if (aiLevel === "random") {
        // Рандомный выбор клетки
        const randomIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
        gameBoard[randomIndex] = 'O'; // Ход ИИ
    } else if (aiLevel === "hard") {
        // Ход с использованием Minimax
        const bestMove = minimaxAlphaBeta(gameBoard, 'O').index;
        gameBoard[bestMove] = 'O'; // Ход ИИ
    }

    updateUI();
    checkForWinOrDraw('Player 2'); // Проверка победы или ничьей

    if (gameActive) {
        currentPlayer = 'Player 1'; // Передача хода игроку
    }
}

// Алгоритм Minimax
function minimaxAlphaBeta(board, player, alpha, beta, depth = 0, maxDepth = 4) {
  // Поиск доступных клеток
  const availSpots = board
      .map((value, index) => (value === '' ? index : null))
      .filter(index => index !== null);
// Проверка завершения игры
  if (checkImmediateWin(board, 'O')) return { score: 10 - depth };
  if (checkImmediateWin(board, 'X')) return { score: depth - 10 };
  if (availSpots.length === 0 || depth >= maxDepth) {
     // Возвращается эвристическая оценка при ничьей или достижении максимальной глубины
      return { score: heuristicEvaluation(board, player) };
  }

  const moves = [];
  let bestMove = null;

  for (let i = 0; i < availSpots.length; i++) {
      const move = {};
      move.index = availSpots[i];
      board[availSpots[i]] = player; // Совершается пробный ход

      let result;
      if (player === 'O') {
         // Выполняется ход соперника
          result = minimaxAlphaBeta(board, 'X', alpha, beta, depth + 1, maxDepth);
          move.score = result.score;
          alpha = Math.max(alpha, move.score); // Обновляется альфа
      } else {
         // Выполняется ход ИИ
          result = minimaxAlphaBeta(board, 'O', alpha, beta, depth + 1, maxDepth);
          move.score = result.score;
          beta = Math.min(beta, move.score); // Обновляется бета
      }

      board[availSpots[i]] = '';  // Ход отменяется
      moves.push(move);

      if (beta <= alpha) break; // Производится альфа-бета отсечение
  }
  // Определяется лучший ход для текущего игрока
  if (player === 'O') {
      bestMove = moves.reduce((best, move) => (move.score > best.score ? move : best), { score: -Infinity });
  } else {
      bestMove = moves.reduce((best, move) => (move.score < best.score ? move : best), { score: Infinity });
  }

  return bestMove;
}

// Функция эвристической оценки для определения силы позиции
function heuristicEvaluation(board, player) {
  let score = 0;
 // Генерируются все выигрышные комбинации
  const winConditions = generateWinConditions();

  for (let condition of winConditions) {
      const playerCount = condition.filter(index => board[index] === player).length;
      const opponentCount = condition.filter(index => board[index] === (player === 'O' ? 'X' : 'O')).length;

      if (playerCount > 0 && opponentCount === 0) {
          score += Math.pow(10, playerCount); // Чем больше фигур игрока, тем выше оценка
      } else if (opponentCount > 0 && playerCount === 0) {
          score -= Math.pow(10, opponentCount);  // Уменьшается оценка за наличие фигур соперника
      }
  }

  return score;
}

// Создание игрового поля
function createBoard() {
  boardElement.innerHTML = ''; // Поле очищается

  // Устанавливаются адаптивные размеры сетки
  boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
  boardElement.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;

    // Инициализируется массив игрового поля
   while (gameBoard.length < boardSize * boardSize) {
    gameBoard = Array(boardSize * boardSize).fill('');
  }
  // Создаются клетки игрового поля
  for (let i = 0; i < boardSize * boardSize; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');  // Присваивается стиль ячейке

    // Присваивается уникальный ID
    cell.id = `cell-${i + 1}`;
    cell.innerText = gameBoard[i];
     // Добавляется обработчик кликов для ячейки
    cell.addEventListener('click', cellClicked);
    
    // Ячейка добавляется в игровое поле
    boardElement.appendChild(cell);
  }

  // Размеры ячеек адаптируются под экран
  resizeBoard();
}

// Изменение размеров поля в зависимости от размеров экрана
function resizeBoard() {
  const boardWidth = Math.min(window.innerWidth, window.innerHeight) * 0.9; // Размер поля 90% от меньшей стороны экрана
  boardElement.style.width = `${boardWidth}px`;
  boardElement.style.height = `${boardWidth}px`;
}
window.addEventListener('resize', resizeBoard); // Добавляется обработчик изменения размера окна

// Обработка хода игрока
function handlePlayerTurn(clickedCellIndex) {
  if (gameBoard[clickedCellIndex] !== '' || !gameActive) {
    return;   // Выполняется проверка доступности клетки
  }

  // Сохранение хода игрока

  // Определяется символ текущего игрока
  const symbol = currentPlayer === 'Player 1' ? 'X' : 'O';
  gameBoard[clickedCellIndex] = symbol; // Сохраняется ход

  checkForWinOrDraw(); // Проверка условий победы/ничьей
  updateUI(); // Обновление UI после проверки
  currentPlayer = currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1'; 
  if (currentPlayer == 'Player 2'){
    setTimeout(makeAIMove, 500); // Ход ИИ выполняется с задержкой
  } // Переключение игрока
}

// Обработка клика по ячейке
function cellClicked(clickedCellEvent) {
  const clickedCell = clickedCellEvent.target; // Определяется кликнутая ячейка
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

// Обновление интерфейса
function updateUI() {
  // Получаются все ячейки
  const cells = document.querySelectorAll('.cell'); 
  for (let i = 0; i < boardSize * boardSize; i++) {
    // Текст ячейки обновляется
    cells[i].innerText = gameBoard[i];
  }

  // Обновление сообщения о текущем игроке
  const currentPlayerDisplay = document.getElementById('currentPlayerDisplay');
  currentPlayerDisplay.innerText = `Current Player: ${currentPlayer}`;
}

// Проверка на победу или ничью
function checkForWinOrDraw() {
  let roundWon = false;
// Генерация всех условий победы
  const winConditions = generateWinConditions();
  const currentSymbol = currentPlayer === 'Player 1' ? 'X' : 'O'; // Символ текущего игрока

  // Проверка условий победы
  for (let condition of winConditions) {
      if (condition.every(index => gameBoard[index] === currentSymbol)) {
          roundWon = true;
          break; // Прерывание цикла при победе
      }
  }

  if (roundWon) {
      announceWinner(currentPlayer); // Объявляется победитель
      gameActive = false; // Завершается игра
      return;
  }

  // Проверка на ничью: если нет доступных ходов и никто не может победить
  if (!gameBoard.includes('') && !canWin('X', gameBoard) && !canWin('O', gameBoard)) {
      announceDraw(); // Объявляется ничья
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

// Прогноз ничьей
function isDrawPredicted() {
  // Если уже есть победитель или поле полностью заполнено
  if (checkImmediateWin() || !gameBoard.includes('')) {
    return false; // Ничья не предсказана
  }

  // Проверка на возможность победы текущим игроком
  return !canWin(currentPlayer, gameBoard); // Если текущий игрок не может выиграть, ничья предсказана
}

// Проверка возможности победы
function canWin(player, board) {
  // Генерация условий победы
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

          if (checkImmediateWin(tempBoard)) return true; // Проверка на немедленную победу
      }
  }

  return false; // Возвращаем false, если нет возможности победить
}

// Немедленная проверка на победу
function checkImmediateWin(board = gameBoard) {
  const winConditions = generateWinConditions(); // Генерация условий победы

  for (let condition of winConditions) {
    if (condition.every(index => board[index] === currentPlayer)) {
      return true; //  true при победе
    }
  }
  return false; // false, если нет победы
}

// Объявление победителя
function announceWinner(player) {
  messageElement.innerText = `${player} Wins!`;  // Сообщение о победе

  if (player === 'Player 1') {
    player1Wins++;
    player1WinsElement.innerText = player1Wins;
  } else {
    player2Wins++;
    player2WinsElement.innerText = player2Wins;
  }

  // Если один из игроков достиг победного счета в турнире
  if (player1Wins >= winMode || player2Wins >= winMode) {
    //  окно с результатами
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


//  результаты турнира
function showTournamentResult(winner) {
  //  текст в модальном окне
  const isTournamentMode = tournamentModeToggle.checked; // галочка для режима турнира

  if (isTournamentMode) {
    const tournamentWinner = document.getElementById('tournamentWinner');
    const tournamentScore = document.getElementById('tournamentScore');
    
    tournamentWinner.innerText = `Победил ${winner}`;
    tournamentScore.innerText = `Счет: ${player1Wins}:${player2Wins}`;

    // модальное окно
    document.getElementById('tournamentResultModal').style.display = 'flex';
  } else {
    setTimeout(() => resetGamebutton(), 2000);
  }
  const closeModalButton = document.getElementById('closeModalButton');
  if (closeModalButton) {
        closeModalButton.addEventListener('click', closeTournamentResult);
  };
}

// Закрытие модального окна турнира
function closeTournamentResult() {
  document.getElementById('tournamentResultModal').style.display = 'none';

 // Сброс счетчиков побед
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
// Обработчик изменения режима турнира
tournamentModeToggle.addEventListener('change', (event) => {
  toggleTournamentMode(event.target.checked);
});

// Переключение режима турнира
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

// Сброс игры
function resetGame() {

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
  winMode = 1; //  режим победы на "до 1 победы"
  winModeSelect.value = winMode; // значение в выпадающем списке
  boardSize = 3; // размер поля по умолчанию
  boardSizeSelect.value = boardSize; // размер в выпадающем списке
  tournamentModeToggle.checked = false; //  режим турнира по умолчанию
  const savedGameData = await loadGame();
  console.log('Loaded game data:', savedGameData);
  if (savedGameData) {
    //  данные из сохранённого состояния
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
  createBoard(); 
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
//нзнаение глобальной фнкии
window.setAILevel = setAILevel;

