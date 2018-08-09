const { MongoClient } = require('mongodb');
const { JSONPath } = require('acamani');

const Driver = require('../lib/Driver');

let connection;
let database;
let driver;

beforeAll(async () => {
  connection = await MongoClient.connect(global.MONGO_URL);
  database = connection.db('atlan');
  driver = new Driver(database);
  driver.addIndex('jedi', [
    {
      path: JSONPath.from(['mentor']),
      ref: 'jedi'
    }
  ]);
});

afterAll(async () => {
  await database.dropDatabase();
  await connection.close(true);
});

test('simple insert', async () => {
  expect.assertions(1);

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

test('nested insert', async () => {
  expect.assertions(1);

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

test('simple query', async () => {
  expect.assertions(1);

  let docs = await driver.getDocs(
    'jedi',
    {
      origin: 'Tatooine'
    },
    [],
    []
  );
  docs.forEach(doc => {
    delete doc._id;
    delete doc.mentor;
  });

  expect(docs).toEqual([
    {
      name: 'Anakin Skywalker',
      origin: 'Tatooine'
    }
  ]);
});

test('query with no results', async () => {
  expect.assertions(1);

  let doc = await driver.getDocs(
    'jedi',
    {
      origin: 'Alderaan'
    },
    [],
    []
  );

  expect(doc).toEqual([]);
});

test('populated query', async () => {
  expect.assertions(1);

  let docs = await driver.getDocs(
    'jedi',
    {
      origin: 'Tatooine'
    },
    [],
    ['jedi']
  );
  docs.forEach(doc => {
    delete doc._id;
    delete doc.mentor._id;
  });

  expect(docs).toEqual([
    {
      name: 'Anakin Skywalker',
      origin: 'Tatooine',
      mentor: {
        name: 'Obi-wan Kenobi',
        origin: 'Stewjon'
      }
    }
  ]);
});

test('simple update', async () => {
  expect.assertions(1);

  let doc = await database.collection('jedi').findOne({
    origin: 'Tatooine'
  });
  await driver.updateDoc('jedi', doc._id, {
    name: 'Darth Vader',
    origin: 'Tatooine'
  });
  doc = await database.collection('jedi').findOne({
    origin: 'Tatooine'
  });
  delete doc._id;
  delete doc.mentor;

  expect(doc).toEqual({
    name: 'Darth Vader',
    origin: 'Tatooine'
  });
});

test('simple deletion', async () => {
  expect.assertions(1);

  let doc = await database.collection('jedi').findOne({
    origin: 'Tatooine'
  });
  await driver.deleteDoc('jedi', doc._id);
  doc = await database.collection('jedi').findOne({
    origin: 'Tatooine'
  });

  expect(doc).toBe(null);
});
