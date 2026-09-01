const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const placesRouter = require('./routes/places');
const usersRouter = require('./routes/users');
const routeEditorRouter = require('./routes/route_editor3D');   // ← 追加(必須)
const placeNodeRouter = require('./routes/place_node');         // ← 追加(施設ノード紐づけ専用)

const app = express();
app.use(cors());
app.use(express.json());   // ← POSTのJSONボディを読むため、ルート登録より前に置く

app.use((req, res, next) => {
    res.setHeader(
        'Content-Type',
        'application/json; charset=utf-8'
    );
    next();
});

// api関数一覧。パスはroutes/*
app.use('/routes/places', placesRouter);
app.use('/routes/users', usersRouter);
app.use('/routes/route_editor3D', routeEditorRouter);   // ← ここを修正
app.use('/routes/place_node', placeNodeRouter);         // ← 追加(施設⇔ノード紐づけ専用API)
//app.use('/routes/place_node', require('./routes/place_node.js'));

app.listen(3000, () => {
    console.log('API Server Start');
});
