const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const placesRouter = require('./routes/places');
const placesUsers = require('./routes/users');

const app = express();

app.use(cors()); 

app.use((req, res, next) => {
    res.setHeader(
        'Content-Type',
        'application/json; charset=utf-8'
    );
    next();
});

//api関数一覧。パスはroutes/*
app.use('/routes/places', placesRouter);
app.use('/routes/users', placesUsers);

app.listen(3000, () => {
    console.log('API Server Start');
});