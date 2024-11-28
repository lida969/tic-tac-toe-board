// jsonbin.js
// Идентификатор JSONBin хранилища
const binId = '6745d217e41b4d34e45af6f2'; 

// Секретный ключ для доступа к API JSONBin
const secretKey = '$2a$10$Xj8xmhXt3sGHC6N8xdo3E.F.Xk.BZpSOOo.FDAwNg8GVGbwKX3Xa6'; 

// Заголовки для запросов
const headers = {
  'Content-Type': 'application/json', // Формат данных — JSON
  'X-Master-Key': secretKey, // Секретный ключ для авторизаци
};

// Функция для сохранения данных игры в JSONBin
export const saveGame = async (gameData) => {
  try {
      // Отправка запроса на сохранение данных
    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
      method: 'PUT', // Обновление данных
      headers: headers,
      body: JSON.stringify(gameData), // Данные игры в формате JSON
    });
 // Проверка успешности запроса
    if (response.ok) {
      console.log('Game data saved successfully!');
    } else {
      console.error('Failed to save game data:', response.statusText);
    }
  } catch (error) {
    console.error('Error saving game data:', error);
  }
};

// Функция для загрузки данных игры из JSONBin
export const loadGame = async () => {
  try {
    // Отправка запроса для получения данных
    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      method: 'GET', // Получение данных
      headers: headers,
    });
// Проверка успешности запроса
    if (response.ok) {
      const { record } = await response.json();
      console.log('Loaded game data:', record);
      return record; // Возврат данных
    } else {
      console.error('Failed to load game data:', response.statusText);
    }
  } catch (error) {
    console.error('Error loading game data:', error);
  }
};
