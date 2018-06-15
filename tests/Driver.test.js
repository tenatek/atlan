const { MongoClient } = require('mongodb');
const { JSONPath } = require('acamani');

const Driver = require('../lib/Driver');

let connection;
let database;
let driver;

beforeAll(async () => {
  connection = await MongoClient.connect(global.__MONGO_URI__);
  database = await connection.db(global.__MONGO_DB_NAME__);
  driver = new Driver(database);
  driver.addIndex('jedi', {
    ref: [
      {
        path: new JSONPath().addPathSegment('mentor'),
        data: {
          ref: 'jedi'
        }
      }
    ]
  });
});

afterAll(async () => {
  await connection.close();
});

test('simple insert of documents', async () => {
  await driver.insertDoc('jedi', {
    name: 'Qui-gon Jinn',
    origin: 'Coruscant'
  });
  let docs = await database
    .collection('jedi')
    .find({})
    .toArray();
  docs.forEach(doc => {
    delete doc._id;
    delete doc.mentor;
  });
  expect(docs).toEqual([
    {
      name: 'Qui-gon Jinn',
      origin: 'Coruscant'
    }
  ]);
});

test('nested insert of documents', async () => {
  await driver.insertDoc('jedi', {
    name: 'Anakin Skywalker',
    origin: 'Tatooine',
    mentor: {
      name: 'Obi-wan Kenobi',
      origin: 'Stewjon'
    }
  });
  let docs = await database
    .collection('jedi')
    .find({})
    .toArray();
  docs.forEach(doc => {
    delete doc._id;
    delete doc.mentor;
  });
  expect(docs).toEqual([
    {
      name: 'Qui-gon Jinn',
      origin: 'Coruscant'
    },
    {
      name: 'Obi-wan Kenobi',
      origin: 'Stewjon'
    },
    {
      name: 'Anakin Skywalker',
      origin: 'Tatooine'
    }
  ]);
});

test('simple query of documents', async () => {
  let doc = await driver.getDocs(
    'jedi',
    {
      origin: 'Tatooine'
    },
    [],
    []
  );
  delete doc._id;
  delete doc.mentor;
  expect(doc).toEqual({
    name: 'Anakin Skywalker',
    origin: 'Tatooine'
  });
});
