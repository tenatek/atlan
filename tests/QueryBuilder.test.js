const ConfigHolder = require('../lib/ConfigHolder');
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

let queryBuilder;

beforeAll(() => {
  let configHolder = new ConfigHolder();
  configHolder.addSchema('jedi', { type: 'object', properties: schema });
  queryBuilder = new QueryBuilder(configHolder);
});

test('simple query building', async () => {
  expect.assertions(1);

  let mongoQuery = queryBuilder.buildQuery('jedi', {
    name: 'Obi-wan Kenobi',
    planetsVisited: '52',
    isAlive: 'false'
  });

  expect(mongoQuery).toEqual({
    $and: [
      { name: 'Obi-wan Kenobi' },
      { planetsVisited: 52 },
      { isAlive: false }
    ]
  });
});
