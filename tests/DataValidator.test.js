const { MongoClient } = require('mongodb');
const { JSONPath } = require('acamani');

const DataValidator = require('../lib/DataValidator');
const Driver = require('../lib/Driver');
const Util = require('../lib/Util');

let model;

let connection;
let database;
let driver;
let dataValidator;

beforeAll(async () => {
  model = {
    schema: {
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
  connection = await MongoClient.connect(global.MONGO_URL);
  database = connection.db('atlan-dv');
  driver = new Driver(database);
  driver.addIndex('jedi', [
    {
      path: JSONPath.from(['mentor']),
      ref: 'jedi'
    }
  ]);
  dataValidator = new DataValidator(driver);
  Util.wrapSchema(model);
  dataValidator.addSchema('jedi', model.schema);
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
