const express = require('express');
const router = express.Router();
const pool = require('../db.js');   // db.js がある場合
// app.js側で `app.use(express.json())` を有効にしておくこと(POSTのJSONボディ用)
// マウント例: app.use('/api/route', require('./routes/route.js'));

/*
  ============================================================
  DBスキーマ(変更後)
  ============================================================
  route_links テーブルは廃止。
  route_nodes に peers (JSON配列: 隣接ノードIDのリスト) を追加する。

  例:
    ALTER TABLE route_nodes ADD COLUMN peers JSON NOT NULL DEFAULT (JSON_ARRAY());
    DROP TABLE IF EXISTS route_links;

  route_nodes:
    id    VARCHAR(255) PRIMARY KEY
    x     DOUBLE
    y     DOUBLE
    z     DOUBLE
    peers JSON   -- 例: ["n2","n5"]
  ============================================================
*/

// peers列がドライバによって文字列/オブジェクトどちらで返るかを吸収
function parsePeers(raw) {
    if (Array.isArray(raw)) return raw;
    if (raw == null) return [];
    try {
        const p = JSON.parse(raw);
        return Array.isArray(p) ? p : [];
    } catch {
        return [];
    }
}

// ノード一覧取得(peersを含む)
router.get('/', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('SET NAMES utf8mb4'); // UTF-8で接続
        const [nodes] = await conn.query('SELECT id, x, y, z, peers FROM route_nodes');
        const result = nodes.map(n => ({
            id: n.id,
            x: n.x,
            y: n.y,
            z: n.z,
            peers: parsePeers(n.peers)
        }));
        res.json({ nodes: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB Error' });
    } finally {
        conn.release();
    }
});

// ノードを全件洗い替えで保存(無理やり上書き)
// リクエストボディは { nodes: [{ id, x, y, z, peers: [id, ...] }, ...] } を想定。
// 互換のため、旧形式の { nodes, links } が送られてきた場合は
// links から各ノードのpeersを算出して吸収する。
router.post('/', async (req, res) => {
    let { nodes = [], links } = req.body || {};

    // 旧形式(links配列)からの移行互換: links が来ていればpeersに変換する
    if (Array.isArray(links) && links.length) {
        const peerMap = new Map(nodes.map(n => [n.id, new Set(n.peers || [])]));
        for (const l of links) {
            if (!peerMap.has(l.a)) peerMap.set(l.a, new Set());
            if (!peerMap.has(l.b)) peerMap.set(l.b, new Set());
            peerMap.get(l.a).add(l.b);
            peerMap.get(l.b).add(l.a);
        }
        nodes = nodes.map(n => ({ ...n, peers: [...peerMap.get(n.id)] }));
    }

    const conn = await pool.getConnection();
    try {
        await conn.query('SET NAMES utf8mb4');
        await conn.beginTransaction();

        // 既存データを全削除
        await conn.query('DELETE FROM route_nodes');

        for (const n of nodes) {
            const peers = Array.isArray(n.peers) ? n.peers : [];
            await conn.query(
                'INSERT INTO route_nodes (id, x, y, z, peers) VALUES (?, ?, ?, ?, ?)',
                [n.id, n.x, n.y, n.z, JSON.stringify(peers)]
            );
        }

        await conn.commit();
        res.json({ ok: true, nodeCount: nodes.length });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ error: 'DB Error' });
    } finally {
        conn.release();
    }
});

module.exports = router;