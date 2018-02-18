const express = require('express');
const { MongoClient } = require('mongodb');

const Atlan = require('../Atlan');

const User = require('./User');
const Post = require('./Post');

const app = express();
const url = 'mongodb://test:test@ds147534.mlab.com:47534/api-test';

let api = new Atlan();

app.use('/api', api.router());

MongoClient.connect(url, (err, db) => {
  api.driver(err, db);
  api.model([['post', Post], ['user', User]]);
});

app.listen(process.env.PORT || 9000);
