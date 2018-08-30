const { MongoClient } = require('mongodb');

const ConfigHandler = require('../lib/ConfigHandler');
const ResourceValidator = require('../lib/ResourceValidator');
const Driver = require('../lib/Driver');

let schema = {
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
};

let connection;
let database;
let driver;
let resourceValidator;

beforeAll(async () => {
  connection = await MongoClient.connect(global.MONGO_URL);
  database = connection.db('atlan-dv');
  let configHandler = new ConfigHandler();
  configHandler.addSchema('jedi', { type: 'object', properties: schema });
  driver = new Driver(database, configHandler);
  resourceValidator = new ResourceValidator(driver, configHandler);
});

afterAll(async () => {
  await database.dropDatabase();
  await connection.close(true);
});

test('simple validation', async () => {
  expect.assertions(2);

  let error;
  try {
    await resourceValidator.validate(
      'jedi',
      {
        origin: 'Naboo'
      },
      true
    );
  } catch (err) {
    error = err;
  }

  expect(error).toEqual(new Error('validation'));
  expect(error.errorPaths).toEqual([['name']]);
});
