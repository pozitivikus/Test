const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Замените на вашего пользователя MySQL
    password: '1111', // Замените на ваш пароль MySQL
    database: 'telegram_game'
});

db.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
    } else {
        console.log('Подключено к базе данных MySQL');
    }
});
app.use(cors({
    origin: 'https://idyllic-muffin-885e78.netlify.app', // Разрешить запросы только с этого домена
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Разрешенные HTTP-методы
    credentials: true // Разрешить передачу куки и заголовков авторизации
}));
// Получение данных пользователя
app.get('/user/:telegram_id', (req, res) => {
    const telegramId = req.params.telegram_id;
    db.query('SELECT * FROM users WHERE telegram_id = ?', [telegramId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json(results[0]);
    });
});

// Обновление данных пользователя
app.post('/user/:telegram_id', (req, res) => {
    const telegramId = req.params.telegram_id;
    const { drops, level } = req.body;
    db.query(
        'INSERT INTO users (telegram_id, drops, level) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE drops = ?, level = ?',
        [telegramId, drops, level, drops, level],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Данные пользователя обновлены', results });
        }
    );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});