const express = require('express');
const { MongoClient } = require('mongodb');
const request = require('supertest');

const Atlan = require('../Atlan');

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

let planetId;
let jediId;

beforeAll(async () => {
  connection = await MongoClient.connect(global.MONGO_URL);
  database = connection.db('atlan-a');
  app = express();
  let api = new Atlan(database, models).api();
  app.use(api);
});

afterAll(async () => {
  await database.dropDatabase();
  await connection.close(true);
});

test('create valid planet', async () => {
  let response = await request(app)
    .post('/planet')
    .send({
      name: 'Tatooine',
      capital: 'Mos Eisley'
    })
    .set('Content-Type', 'application/json');
  planetId = response.body;

  expect.assertions(1);
  expect(typeof planetId).toBe('string');
});

test('create invalid planet', async () => {
  let response = await request(app)
    .post('/planet')
    .send({
      name: 3
    })
    .set('Content-Type', 'application/json');

  expect.assertions(1);
  expect(response.body).toEqual([['capital'], ['name']]);
});

test('create valid jedi', async () => {
  let response = await request(app)
    .post('/jedi')
    .send({
      name: 'Anakin Skywalker',
      homePlanet: planetId
    })
    .set('Content-Type', 'application/json');
  jediId = response.body;

  expect.assertions(1);
  expect(typeof jediId).toBe('string');
});

test('create another valid jedi', async () => {
  let response = await request(app)
    .post('/jedi')
    .send({
      name: 'Ezra Bridger',
      homePlanet: {
        name: 'Lothal',
        capital: 'Lothal City'
      }
    })
    .set('Content-Type', 'application/json');

  expect.assertions(1);
  expect(typeof response.body).toBe('string');
});

test('create invalid jedi', async () => {
  let response = await request(app)
    .post('/jedi')
    .send({
      name: 'Anakin Skywalker',
      homePlanet: 'wrongid'
    })
    .set('Content-Type', 'application/json');

  expect.assertions(1);
  expect(response.body).toEqual([['homePlanet']]);
});

test('create another invalid jedi', async () => {
  let response = await request(app)
    .post('/jedi')
    .send({
      name: 'Obi-Wan Kenobi',
      homePlanet: {
        name: 'Stewjon'
      }
    })
    .set('Content-Type', 'application/json');

  expect.assertions(1);
  expect(response.body).toEqual([['homePlanet', 'capital']]);
});

test('update jedi with valid data', async () => {
  let response = await request(app)
    .patch(`/jedi/${jediId}`)
    .send({
      name: 'Darth Vader'
    })
    .set('Content-Type', 'application/json');

  expect.assertions(1);
  expect(response.status).toBe(200);
});

test('retrieve one jedi', async () => {
  let response = await request(app).get(`/jedi/${jediId}`);

  expect.assertions(1);
  expect(response.body).toEqual({
    _id: jediId,
    name: 'Darth Vader',
    homePlanet: planetId
  });
});

test('retrieve jedi with query', async () => {
  let response = await request(app).get(
    `/jedi?homePlanet=${planetId}&_populate=planet`
  );

  expect.assertions(1);
  expect(response.body).toEqual([
    {
      _id: jediId,
      name: 'Darth Vader',
      homePlanet: {
        _id: planetId,
        name: 'Tatooine',
        capital: 'Mos Eisley'
      }
    }
  ]);
});

test('update jedi with more valid data', async () => {
  let response = await request(app)
    .patch(`/jedi/${jediId}`)
    .send({
      homePlanet: {
        name: 'Mustafar',
        capital: 'Black Fortress'
      }
    })
    .set('Content-Type', 'application/json');

  expect.assertions(1);
  expect(response.status).toBe(200);
});

test('update jedi with invalid data', async () => {
  let response = await request(app)
    .patch(`/jedi/${jediId}`)
    .send({
      title: true
    })
    .set('Content-Type', 'application/json');

  expect.assertions(1);
  expect(response.body).toEqual([['title']]);
});

test('delete one jedi', async () => {
  let response = await request(app).delete(`/jedi/${jediId}`);

  expect.assertions(1);
  expect(response.status).toBe(200);
});

test('retrieve all jedi', async () => {
  let response = await request(app).get('/jedi');

  expect.assertions(1);
  expect(response.body.length).toBe(1);
});
