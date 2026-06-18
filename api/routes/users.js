const express = require('express');
const router = express.Router();
const pool = require('../db.js');   // db.js がある場合

router.get('/', async (req, res) => {

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

module.exports = router;