const express = require('express');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

const atlan = require('../Atlan');

dotenv.config();

const app = express();

MongoClient.connect(
  process.env.MONGO_URL,
  (err, db) => {
    let router = atlan(db.db('atlan'), {
      test: {
        schema: {
          type: 'object',
          properties: {
            test: {
              type: 'string',
              required: true
            }
          }
        }
      }
    });
    app.use(router);
  }
);

app.listen(3000);
