const { MongoClient } = require('mongodb');
const { JSONPath } = require('acamani');

const DataValidator = require('../lib/DataValidator');
const Driver = require('../lib/Driver');

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      required: true
    },
    mentor: {
      type: 'ref',
      ref: 'jedi'
    },
    origin: {
      type: 'string',
      required: true
    }
  }
};

let connection;
let database;
let driver;
let dataValidator;

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
  dataValidator = new DataValidator(driver);
  dataValidator.addSchema('jedi', schema);
});

afterAll(async () => {
  await database.dropDatabase();
  await connection.close(true);
});

test('simple validation', async () => {
  expect.assertions(2);

  let error;
  try {
    await dataValidator.validateInsert('jedi', {
      origin: 'Naboo'
    });
  } catch (err) {
    error = err;
  }

  expect(error).toEqual(new Error('validation'));
  expect(error.errorPaths).toEqual([['name']]);
});
