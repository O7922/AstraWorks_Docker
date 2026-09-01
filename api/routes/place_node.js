const express = require('express');
const router = express.Router();
const pool = require('../db.js');

// 施設一覧取得
// GET /routes/place_node            -> 全ての (place_id, node_id) ペアを返す(道案内用)
// GET /routes/place_node?node_id=xx -> 指定ノードに紐づく施設一覧を返す(ポップアップ用)
router.get('/', async (req, res) => {
    const { node_id } = req.query;

    const conn = await pool.getConnection();
    try {
        await conn.query('SET NAMES utf8mb4');

        if (node_id) {
            const [rows] = await conn.query(
                `SELECT p.id AS place_id, p.name
                 FROM places p
                 JOIN place_node_link l ON p.id = l.place_id
                 WHERE l.node_id = ?`,
                [node_id]
            );
            return res.json(rows);
        }

        // node_id指定なし: 全件のリンク(place_id, node_id)を返す
        const [rows] = await conn.query(
            `SELECT place_id, node_id FROM place_node_link`
        );
        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB Error' });
    } finally {
        conn.release();
    }
});

// 施設を新規作成し、ノードに紐づける
// POST /routes/place_node  body: { node_id, name }
router.post('/', async (req, res) => {
    const { node_id, name } = req.body || {};
    if (!node_id || !name) return res.status(400).json({ error: 'node_id and name are required' });

    const conn = await pool.getConnection();
    try {
        await conn.query('SET NAMES utf8mb4');
        await conn.beginTransaction();

        const [result] = await conn.query('INSERT INTO places (name) VALUES (?)', [name]);
        const placeId = result.insertId;

        await conn.query(
            'INSERT INTO place_node_link (place_id, node_id) VALUES (?, ?)',
            [placeId, node_id]
        );

        await conn.commit();
        res.json({ ok: true, place_id: placeId, node_id, name });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ error: 'DB Error' });
    } finally {
        conn.release();
    }
});

// 施設名を変更(placesのみ更新)
// PUT /routes/place_node/:place_id  body: { name }
router.put('/:place_id', async (req, res) => {
    const { place_id } = req.params;
    const { name } = req.body || {};
    if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });

    const conn = await pool.getConnection();
    try {
        await conn.query('SET NAMES utf8mb4');
        await conn.query('UPDATE places SET name = ? WHERE id = ?', [name.trim(), place_id]);
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB Error' });
    } finally {
        conn.release();
    }
});

// ノードとの紐づけのみ削除(place_node_linkの該当行を削除)
// DELETE /routes/place_node?place_id=xxx&node_id=yyy
router.delete('/', async (req, res) => {
    const { place_id, node_id } = req.query;
    if (!place_id || !node_id) return res.status(400).json({ error: 'place_id and node_id are required' });

    const conn = await pool.getConnection();
    try {
        await conn.query(
            'DELETE FROM place_node_link WHERE place_id = ? AND node_id = ?',
            [place_id, node_id]
        );
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB Error' });
    } finally {
        conn.release();
    }
});

module.exports = router;