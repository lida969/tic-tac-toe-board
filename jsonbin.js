// jsonbin.js

const binId = '6745d217e41b4d34e45af6f2'; // Замените на ваш JSONBin ID
const secretKey = '$2a$10$.9.5T8S.ADB53ETyAsvD8uoxvYmDhwZq8dnVGogmIn0pD8abZuBNy'; // Ваш секретный ключ (не кодировать)

const headers = {
  'Content-Type': 'application/json',
  'X-Master-Key': secretKey, // Используйте ключ без кодирования
};

// Сохранение данных игры в JSONBin
export const saveGame = async (gameData) => {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(gameData),
    });

    if (response.ok) {
      console.log('Game data saved successfully!');
    } else {
      console.error('Failed to save game data:', response.statusText);
    }
  } catch (error) {
    console.error('Error saving game data:', error);
  }
};

// Загрузка данных игры из JSONBin
export const loadGame = async () => {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      method: 'GET',
      headers: headers,
    });

    if (response.ok) {
      const { record } = await response.json();
      console.log('Loaded game data:', record);
      return record;
    } else {
      console.error('Failed to load game data:', response.statusText);
    }
  } catch (error) {
    console.error('Error loading game data:', error);
  }
};
