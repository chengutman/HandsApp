const mongoose = require('mongoose');
const { DB_HOST, DB_USER, DB_PASS } = require('../Configs/db_constants');

const url = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}`;
const options = {
 useCreateIndex: true,
 useNewUrlParser: true,
 useUnifiedTopology: true
};

mongoose.connect(url, options);

const connection = mongoose.connection;

connection.on('error', err => console.error('connection error: ', err));
connection.once('open', () => console.log('connected to: ', connection.name));

module.exports = connection;
