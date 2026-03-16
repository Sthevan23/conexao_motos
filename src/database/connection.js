'use strict';
const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const storagePath = process.env.DB_STORAGE || 'db.sqlite3';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.isAbsolute(storagePath) ? storagePath : path.join(__dirname, '..', '..', storagePath),
    logging: false,
});

module.exports = sequelize;
