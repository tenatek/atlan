const { JSONPath } = require('acamani');

const SchemaHandler = require('../lib/SchemaHandler');

const schema = {
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
};

test('wrapping', () => {
  expect.assertions(1);

  let wrappedSchema = SchemaHandler.wrapSchema(schema);

  expect(wrappedSchema).toEqual({
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
  });
});

test('get correct reference paths', () => {
  expect.assertions(1);

  let indexingResults = SchemaHandler.indexSchema(schema);
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
