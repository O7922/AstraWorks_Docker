const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();

app.use(cors()); 

app.use((req, res, next) => {
    res.setHeader(
        'Content-Type',
        'application/json; charset=utf-8'
    );
    next();
});

const pool = mysql.createPool({
    host: 'db',
    user: 'sampleuser',
    password: 'samplepass',
    database: 'sampledb',
    charset: 'utf8mb4'
});

app.get('/users', async (req, res) => {

    try {

        const [rows] = await pool.query(
            'SELECT id, name FROM users'
        );

        res.json(rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: 'DB Error'
        });
    }
});

app.listen(3000, () => {
    console.log('API Server Start');
});