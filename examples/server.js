const express = require('express');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

const Atlan = require('../Atlan');
const User = require('./User');
const Post = require('./Post');

dotenv.config();

const app = express();
const api = new Atlan();

app.use('/api', api.router());

MongoClient.connect(process.env.MONGO_URL, (err, db) => {
  api.driver(err, db);
  api.model([['post', Post], ['user', User]]);
});

app.listen(process.env.PORT);
