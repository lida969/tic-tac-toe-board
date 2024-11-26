// jsonbin.js

const binId = '674597cbacd3cb34a8af10eb'; // Замените на ваш JSONBin ID
const secretKey = 'В$2a$10$nvY3YosON8Wnawzqa98jNeTr36wahLksHTjPiGJ1kpvaN8c0KX9M.'; // Замените на ваш секретный ключ
// Сохранение данных игры в JSONBin
export const saveGame = async (gameData) => {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': secretKey,
      },
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
      headers: {
        'X-Master-Key': secretKey,
      },
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
