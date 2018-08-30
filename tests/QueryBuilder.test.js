const ConfigHandler = require('../lib/ConfigHandler');
const QueryBuilder = require('../lib/QueryBuilder');

const schema = {
  name: {
    type: 'string',
    required: true
  },
  planetsVisited: {
    type: 'number',
    required: true
  },
  isAlive: {
    type: 'boolean',
    required: true
  }
};

let configHandler;

beforeAll(() => {
  configHandler = new ConfigHandler();
  configHandler.addSchema('jedi', { type: 'object', properties: schema });
});

test('simple query building', async () => {
  let queryBuilder = new QueryBuilder(
    'jedi',
    {
      name: 'Obi-wan Kenobi',
      planetsVisited: '52',
      isAlive: 'false'
    },
    configHandler
  );

  let mongoQuery = queryBuilder.buildQuery();

  expect.assertions(1);
  expect(mongoQuery).toEqual({
    $and: [
      { name: 'Obi-wan Kenobi' },
      { planetsVisited: 52 },
      { isAlive: false }
    ]
  });
});
