'use strict';
require('dotenv').config();
const path = require('path');
const express = require('express');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

const routes = require('./src/routes');
const { sequelize } = require('./src/models');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', routes);

// 404
app.use((req, res) => {
    res.status(404).send('Página não encontrada (404).');
});

// Start
sequelize.authenticate()
    .then(() => {
        console.log('✅ Conectado ao banco de dados SQLite.');
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Erro ao conectar ao banco:', err);
        process.exit(1);
    });
