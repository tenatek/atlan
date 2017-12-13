const express = require('express');
const { MongoClient } = require('mongodb');
const Atlan = require('../index');

const User = require('./User');

const app = express();
const url = 'mongodb://test:test@ds147534.mlab.com:47534/api-test';

let api = new Atlan();

app.use('/api', api.router());

MongoClient.connect(url, (err, db) => {
  api.driver(err, db);
  api.model('user', User);
});

app.listen(process.env.PORT || 9000);
