const express = require('express');
const { MongoClient } = require('mongodb');
const request = require('supertest');

const atlan = require('../Atlan');

const models = {
  jedi: {
    schema: {
      name: {
        type: 'string',
        required: true
      },
      title: {
        type: 'string'
      },
      homePlanet: {
        type: 'ref',
        ref: 'planet'
      }
    }
  },
  planet: {
    schema: {
      name: {
        type: 'string',
        required: true
      },
      capital: {
        type: 'string',
        required: true
      },
      population: {
        type: 'number'
      }
    }
  }
};

let connection;
let database;
let app;

beforeAll(async () => {
  connection = await MongoClient.connect(global.MONGO_URL);
  database = connection.db('atlan-a');
  app = express();
  let api = atlan(database, models);
  app.use(api);
});

afterAll(async () => {
  await database.dropDatabase();
  await connection.close(true);
});

test('get jedi', async () => {
  let response = await request(app)
    .get('/jedi')
    .set('Accept', 'application/json');

  expect.assertions(1);
  expect(response.body).toEqual([]);
});
