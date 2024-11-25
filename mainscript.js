// Получаем кнопки
const playWithFriendButton = document.getElementById('playWithFriend');
const playWithAIButton = document.getElementById('playWithAI');

// Обработчики событий для перехода к игровым режимам
playWithFriendButton.addEventListener('click', () => {
    window.location.href = 'playWithFriend/index.html'; // Перенаправление на страницу для игры с другом
});

playWithAIButton.addEventListener('click', () => {
    window.location.href = 'playWithAI/index.html'; // Перенаправление на страницу для игры с ИИ
});