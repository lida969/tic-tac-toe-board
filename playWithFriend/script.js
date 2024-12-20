import { saveGame, loadGame } from '../jsonbin.js'; // Импорт функций

let currentPlayer = 'Player 1'; // Текущий игрок
let gameBoard = [];  // Массив для хранения состояния поля
let gameActive = true; // Флаг для отслеживания активной игры
let player1Wins = 0;  // Количество побед для игрока 1
let player2Wins = 0;  // Количество побед для игрока 2
let winMode = 1;  // Режим победы (например, до 1 победы)
let boardSize = 3;  // Размер поля (по умолчанию 3x3)

// ссылки на элементы
const winModeSelect = document.getElementById('winMode');
const boardSizeSelect = document.getElementById('boardSize');
const resetButton = document.getElementById('resetButton');
const messageElement = document.getElementById('gameMessage');
const player1WinsElement = document.getElementById('player1Wins');
const player2WinsElement = document.getElementById('player2Wins');
const toggleThemeButton = document.getElementById('toggleTheme');
const tournamentModeToggle = document.getElementById('tournamentModeToggle');
const boardElement = document.getElementById('tic-tac-toe-board');
let isPlayer1Turn = true; // Переменная для отслеживания первого хода 


// Обработчик изменений для выбора режима победы
winModeSelect.addEventListener('change', (event) => {
  winMode = parseInt(event.target.value);  // Обновляение режим победы
  player1Wins = 0;  // Сброс победы игроков
  player2Wins = 0;
  player1WinsElement.innerText = player1Wins;
  player2WinsElement.innerText = player2Wins;
  resetGamebutton(); // Сбрас игры при изменении режима побед
});

// Обработчик для кнопки сброса
resetButton.addEventListener('click', () => {
  player1Wins = 0;
  player2Wins = 0;
  player1WinsElement.innerText = player1Wins;
  player2WinsElement.innerText = player2Wins;
  resetGamebutton();
});

// Обработчик для изменения размера поля
boardSizeSelect.addEventListener('change', (event) => {
  boardSize = parseInt(event.target.value);
  player1Wins = 0;
  player2Wins = 0;
  player1WinsElement.innerText = player1Wins;
  player2WinsElement.innerText = player2Wins;
  createBoard();
  resetGamebutton();
});

// Функция для создания игрового поля
function createBoard() {
  console.log('createBoard вызвана');
  boardElement.innerHTML = ''; // Очистка текущего поле

  //  адаптивные размеры сетки
  boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
  boardElement.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;

  // Очистить массив поля, если его размер изменился
  console.log('gameBoard',  gameBoard);
  while (gameBoard.length < boardSize * boardSize) {
    gameBoard = Array(boardSize * boardSize).fill('');
  }
// Заполнение поля ячейками
  for (let i = 0; i < boardSize * boardSize; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');

    // уникальный ID для каждой ячейки
    cell.id = `cell-${i + 1}`;
    // Заполнение ячейки текущим состоянием
    cell.innerText = gameBoard[i];
    
    // обработчик кликов
    cell.addEventListener('click', cellClicked);
    
    // Добавление ячейки в поле
    boardElement.appendChild(cell);
  }

  // Адаптация
  resizeBoard();
}

// Функция для изменения размера поля в зависимости от экрана
function resizeBoard() {
  // Размер поля 90% от меньшей стороны экрана
  const boardWidth = Math.min(window.innerWidth, window.innerHeight) * 0.9; 
  boardElement.style.width = `${boardWidth}px`;
  boardElement.style.height = `${boardWidth}px`;
}
// Обработчик изменения размера окна
window.addEventListener('resize', resizeBoard);

// Функция для обработки хода игрока
function handlePlayerTurn(clickedCellIndex) {
  if (gameBoard[clickedCellIndex] !== '' || !gameActive) {
    return; // Если ячейка уже занята или игра завершена, не делаем ход
  }

  // Сохранение хода игрока
  const symbol = currentPlayer === 'Player 1' ? 'X' : 'O'; // Определение символа
  gameBoard[clickedCellIndex] = symbol;

  checkForWinOrDraw(); // Проверка условий победы/ничьей
  updateUI(); // Обновление UI после проверки
  currentPlayer = currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1'; // Переключение игрока
}


// Функция для обработки клика по ячейке
function cellClicked(clickedCellEvent) {
  // Получание ячейки, по которой кликнули
  const clickedCell = clickedCellEvent.target;
  // Определение индекса ячейки
  const clickedCellIndex = parseInt(clickedCell.id.replace('cell-', '')) - 1;

   // Если ячейка занята или игра завершена, пропускаем ход
  if (gameBoard[clickedCellIndex] !== '' || !gameActive) return;

  // Определение символа текущего игрока
  const symbol = currentPlayer === 'Player 1' ? 'X' : 'O';
  gameBoard[clickedCellIndex] = symbol;
  // Проверка на победу или ничью
  checkForWinOrDraw();
  // Переключение игрока
  currentPlayer = currentPlayer === 'Player 1' ? 'Player 2' : 'Player 1';
  updateUI();

  // Сохранение текущего состояния
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

// Функция для обновления пользовательского интерфейса
function updateUI() {
  // Получание все ячейки
 const cells = document.querySelectorAll('.cell');
  for (let i = 0; i < boardSize * boardSize; i++) {
    // Обновление содержимое ячеек
    cells[i].innerText = gameBoard[i];
  }
  // Обновление сообщения о текущем игроке
  const currentPlayerDisplay = document.getElementById('currentPlayerDisplay');
  currentPlayerDisplay.innerText = `Current Player: ${currentPlayer}`;
}

// Функция для проверки условий победы или ничьей
function checkForWinOrDraw() {
  let roundWon = false;

  // возможные условия для победы
  const winConditions = generateWinConditions();
  const currentSymbol = currentPlayer === 'Player 1' ? 'X' : 'O'; // Символ текущего игрока

  // Проверка условий победы
  for (let condition of winConditions) {
      if (condition.every(index => gameBoard[index] === currentSymbol)) {
        // Победа, если все ячейки в линии содержат одинаковый символ
          roundWon = true;
          break;
      }
  }
  if (roundWon) {
      announceWinner(currentPlayer); // Объявляем победителя
      gameActive = false;  // Завершаем игру
      return;
  }
  // Проверка на ничью: если нет доступных ходов и никто не может победить
  if (!gameBoard.includes('') && !canWin('X', gameBoard) && !canWin('O', gameBoard)) {
      announceDraw(); // Объявляем ничью
  }
}


// Функция для генерации возможных условий для победы (горизонтали, вертикали, диагонали)
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
  // Проверяется, существует ли уже победитель или заполнено ли игровое поле полностью
  if (checkImmediateWin() || !gameBoard.includes('')) {
     // Возвращается false, если ничья невозможна
    return false;
  }
 // Выполняется проверка на возможность ничьей для текущего состояния игры
  return !canWin(currentPlayer, gameBoard);
}


function canWin(player, board) {
   // Генерируются все возможные условия для победы
  const winConditions = generateWinConditions();
  for (let condition of winConditions) {
     // Проверяется, являются ли все ячейки в условии либо доступными, либо уже принадлежащими игроку
      const hasPotential = condition.every(index => 
          board[index] === player || board[index] === '' // Проверка доступности для победы
      );
      if (hasPotential) {
        // Копируется текущее состояние игрового поля
          const tempBoard = [...board];
          for (let index of condition) {
             // Выполняется временная установка символа игрока в доступные ячейки
              if (tempBoard[index] === '') tempBoard[index] = player; 
          }
        // Проверяется, приводит ли это к мгновенной победе
          if (checkImmediateWin(tempBoard)) return true;
      }
  }
    // Возвращается false, если победа невозможна для игрока
  return false;
}

function checkImmediateWin(board = gameBoard) {
   // Генерируются условия победы
  const winConditions = generateWinConditions();

  for (let condition of winConditions) {
     // Проверяется, заполнены ли все ячейки условия символами текущего игрока
    if (condition.every(index => board[index] === currentPlayer)) {
      return true; // Возвращается true, если победа достигнута
    }
  }
   // Возвращается false, если победа не найдена
  return false;
}


function announceWinner(player) {
   // Отображается сообщение о победе игрока
  messageElement.innerText = `${player} Wins!`;
  if (player === 'Player 1') {
    // Увеличивается счет для игрока 1
    player1Wins++;
    player1WinsElement.innerText = player1Wins;
  } else {
    player2Wins++;
    player2WinsElement.innerText = player2Wins;
  }
   // Проверяется, достиг ли кто-либо из игроков победного количества очков в турнире
  if (player1Wins >= winMode || player2Wins >= winMode) {
    // Показываем окно с результатами
    showTournamentResult(player);
     // Игра завершается
    gameActive = false;
  } else {
    // Осуществляется сброс текущей игры через 2 секунды
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
  // Устанавливается текстовое сообщение в модальном окне в зависимости от режима
  const isTournamentMode = tournamentModeToggle.checked; // Проверяется, включен ли режим турнира

  if (isTournamentMode) {
    // В модальном окне указывается победитель и текущий счет
    const tournamentWinner = document.getElementById('tournamentWinner');
    const tournamentScore = document.getElementById('tournamentScore');
    
    tournamentWinner.innerText = `Победил ${winner}`;
    tournamentScore.innerText = `Счет: ${player1Wins}:${player2Wins}`;

    // Модальное окно становится видимым
    document.getElementById('tournamentResultModal').style.display = 'flex';
  }
  else {
    setTimeout(() => resetGamebutton(), 2000);
  
  }
   // Устанавливается обработчик для кнопки закрытия модального окна
  const closeModalButton = document.getElementById('closeModalButton');
  if (closeModalButton) {
        closeModalButton.addEventListener('click', closeTournamentResult);
  }
}

function closeTournamentResult() {
  // Скрывается модальное окно результатов турнира
  document.getElementById('tournamentResultModal').style.display = 'none';

  // Обнуляются счетчики побед игроков
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
  });
}


// Объявление ничьей
function announceDraw() {
  // Отображается сообщение о ничье
  messageElement.innerText = 'Game Draw!';
  gameActive = false; // Игра завершается
// Через 2 секунды сбрасывается игра
  setTimeout(() => resetGamebutton(), 2000);
    // Сохраняется текущее состояние игры
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
  // Выполняется переключение между турниром и обычным режимом
  toggleTournamentMode(event.target.checked);
});


function toggleTournamentMode(isTournamentMode) {
  // Изменяется видимость секций, связанных с турниром
  const scoreElements = document.getElementById('scoreSection');
  const tournamentSettings = document.getElementById('tournamentSettings');

  if (isTournamentMode) {
    // Отображаются настройки и счетчики турнира
    scoreElements.style.display = 'block';
    tournamentSettings.style.display = 'block';
    //player1Wins = savedGameData.player1Wins || 0;
    //player2Wins = savedGameData.player2Wins || 0;
    //player1WinsElement.innerText = player1Wins;
    //player2WinsElement.innerText = player2Wins;
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
  //isPlayer1Turn = !isPlayer1Turn;

  // Устанавливаем первого игрока в зависимости от текущего значения isPlayer1Turn
 // currentPlayer =  savedGameData.currentPlayer || 'Player 1';
  
  //gameBoard.fill('');
  // Устанавливается первый игрок и обновляется интерфейс
  gameActive = true;
  updateUI(); // Обновление интерфейса
  messageElement.innerText = '';

  // Сохранение текущего состояния после сброса
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

async function initializeGame() {
  // Устанавливаются параметры игры по умолчанию
  winMode = 1; // Количество побед до окончания матча
  winModeSelect.value = winMode; //  значение в выпадающем списке
  boardSize = 3; // Размер игрового поля
  boardSizeSelect.value = boardSize; 
  tournamentModeToggle.checked = false; // Режим турнира отключен по умолчанию
  
   // Загружаются данные из сохраненного состояния
  const savedGameData = await loadGame();
  console.log('Loaded game data:', savedGameData);
  if (savedGameData) {
    // Восстанавливаются параметры и состояние из сохранения
    gameBoard = savedGameData.gameBoard || Array(boardSize * boardSize).fill('');
    currentPlayer = savedGameData.currentPlayer || 'Player 1';
    player1Wins = savedGameData.player1Wins || 0;
    player2Wins = savedGameData.player2Wins || 0;
    boardSize = savedGameData.boardSize || 3;
    winMode = savedGameData.winMode || 1;
    const isTournamentMode = savedGameData.isTournamentMode || false;
    tournamentModeToggle.checked = isTournamentMode;
    
    winModeSelect.value = winMode;
    boardSizeSelect.value = boardSize;
    player1WinsElement.innerText = player1Wins;
    player2WinsElement.innerText = player2Wins;
    toggleTournamentMode(isTournamentMode);
  }
  else {
     // Если сохранений нет, инициализируются начальные параметры
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
  // Переключается начальный игрок
  isPlayer1Turn = !isPlayer1Turn;
  currentPlayer = isPlayer1Turn ? 'Player 1' : 'Player 2';
  // Очищается игровое поле и обновляется интерфейс
  gameBoard = Array(boardSize * boardSize).fill('');
  gameActive = true;
  messageElement.innerText = '';
  const isTournamentMode = tournamentModeToggle.checked;
  createBoard(); 
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
  // Обнуляются счетчики, если турнирный режим выключен
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
