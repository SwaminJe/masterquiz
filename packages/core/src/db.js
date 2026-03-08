import mysql from 'mysql2/promise';
import { config } from './config.js';
import { randomUUID } from 'crypto';

export const pool = mysql.createPool({
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
});

export async function initDB() {
  const conn = await pool.getConnection();

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS Questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question VARCHAR(500) NOT NULL,
      responses JSON NOT NULL,
      buzzer BOOLEAN DEFAULT false,
      type ENUM('multiple', 'buzzer', 'blind_test') NOT NULL,
      difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
      timer INT DEFAULT 30
    )
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS Game (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      code VARCHAR(6) NOT NULL,
      name VARCHAR(255) NOT NULL,
      currentQuestion INT,
      FOREIGN KEY (currentQuestion) REFERENCES Questions(id)
    )
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS Player (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      currentGame VARCHAR(36) NOT NULL,
      name VARCHAR(20),
      score INT DEFAULT 0,
      isSpectator BOOLEAN DEFAULT false,
      isAdmin BOOLEAN DEFAULT false,
      FOREIGN KEY (currentGame) REFERENCES Game(id)
    )
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS Responses (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      game VARCHAR(36) NOT NULL,
      player VARCHAR(36) NOT NULL,
      question INT NOT NULL,
      response VARCHAR(500) NOT NULL,
      win BOOLEAN DEFAULT false,
      FOREIGN KEY (game) REFERENCES Game(id),
      FOREIGN KEY (player) REFERENCES Player(id),
      FOREIGN KEY (question) REFERENCES Questions(id)
    )
  `);

  conn.release();
  console.log('DB initialized');
}

// Helpers pour créer des entrées avec UUID
export function createGame(name, code) {
  const id = randomUUID();
  return pool.execute(
    'INSERT INTO Game (id, code, name) VALUES (?, ?, ?)',
    [id, code, name]
  ).then(() => id);
}

export function createPlayer(currentGame, isAdmin = false) {
  const id = randomUUID();
  return pool.execute(
    'INSERT INTO Player (id, currentGame, isAdmin) VALUES (?, ?, ?)',
    [id, currentGame, isAdmin]
  ).then(() => id);
}

export function createResponse(game, player, question, response) {
  const id = randomUUID();
  return pool.execute(
    'INSERT INTO Responses (id, game, player, question, response) VALUES (?, ?, ?, ?, ?)',
    [id, game, player, question, response]
  ).then(() => id);
}
