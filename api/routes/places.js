const express = require('express');
const router = express.Router();
const pool = require('../db.js');

router.get('/', async (req, res) => {
    try {
        let names = req.query.name;

        if (!names) {
            const [rows] = await pool.query(
                'SELECT id, name FROM places'
            );
            return res.json(rows);
        }

        if (!Array.isArray(names)) {
            names = [names];
        }

        const conditions = names
            .map(() => 'name LIKE ?')
            .join(' OR ');

        const params = names.map(name => `%${name}%`);

        const sql = `
            SELECT id, name
            FROM places
            WHERE ${conditions}
        `;

        const [rows] = await pool.query(sql, params);

        res.json(rows);

    } catch (err) {
        console.error('DB ERROR:', err);
        res.status(500).json({
            error: 'DB Error'
        });
    }
});

module.exports = router;