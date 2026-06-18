const express = require('express');
const router = express.Router();
const pool = require('../db.js');

router.get('/', async (req, res) => {
    try {
        let names = req.query.name;

        // パラメータが無い場合
        if (!names) {
            const [rows] = await pool.query(
                'SELECT id, name FROM places'
            );

            return res.json(rows);
        }

        // 1件だけの場合は配列化
        if (!Array.isArray(names)) {
            names = [names];
        }

        const [rows] = await pool.query(
            'SELECT id, name FROM places WHERE name IN (?)',
            [names]
        );

        res.json(rows);

    } catch (err) {
        console.error('DB ERROR:', err);

        res.status(500).json({
            error: 'DB Error'
        });
    }
});

module.exports = router;