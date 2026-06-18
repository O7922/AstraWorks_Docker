const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'db',
    user: 'sampleuser',
    password: 'samplepass',
    database: 'sampledb',
    charset: 'utf8mb4'
});

module.exports = pool;

//(async () => {
//    const conn = await pool.getConnection();
//    await conn.query('SET NAMES utf8mb4');
//    conn.release();
//})();