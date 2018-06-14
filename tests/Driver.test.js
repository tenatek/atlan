const { MongoClient } = require('mongodb');

const Driver = require('../lib/Driver');

let connection;
let database;
let driver;

beforeAll(async () => {
  connection = await MongoClient.connect(global.__MONGO_URI__);
  database = await connection.db(global.__MONGO_DB_NAME__);
  driver = new Driver(database);
  driver.addIndex('jedi', {});
});

afterAll(async () => {
  await connection.close();
});

test('simple insert of documents', async () => {
  await driver.insertDoc('jedi', {
    name: 'Anakin Skywalker',
    origin: 'Tatooine'
  });
  let docs = await database
    .collection('jedi')
    .find({})
    .toArray();
  docs.forEach(doc => {
    delete doc._id;
  });
  expect(docs).toEqual([
    {
      name: 'Anakin Skywalker',
      origin: 'Tatooine'
    }
  ]);
});
