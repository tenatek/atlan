const { JSONPath } = require('acamani');

const SchemaIndexer = require('../lib/SchemaIndexer');
const Util = require('../lib/Util');

let model;

beforeAll(() => {
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
      visitedPlanets: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              required: true
            },
            ruler: {
              type: 'ref',
              ref: 'person',
              required: true
            }
          }
        }
      }
    }
  };
  Util.wrapSchema(model);
});

test('get correct reference paths', () => {
  expect.assertions(1);

  let indexingResults = SchemaIndexer.indexSchema(model.schema);
  let expectedResults = [
    {
      path: JSONPath.from(['mentor']),
      ref: 'jedi'
    },
    {
      path: JSONPath.from(['visitedPlanets', '*', 'ruler']),
      ref: 'person'
    }
  ];

  expect(indexingResults).toEqual(expectedResults);
});
