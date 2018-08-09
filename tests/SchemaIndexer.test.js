const { JSONPath } = require('acamani');

const SchemaIndexer = require('../lib/SchemaIndexer');

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      required: true
    },
    telephone: {
      type: 'ref',
      ref: 'some-model'
    },
    email: {
      type: 'string',
      required: true
    },
    pets: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'object',
            properties: {
              first: {
                type: 'ref',
                ref: 'some-model',
                required: true
              },
              family: {
                type: 'string'
              }
            },
            required: true
          },
          age: {
            type: 'ref',
            ref: 'some-model',
            required: true
          }
        }
      }
    }
  }
};

test('get correct reference paths', () => {
  expect.assertions(1);

  let indexingResults = SchemaIndexer.indexSchema(schema);
  let expectedResults = [
    {
      path: JSONPath.from(['telephone']),
      ref: 'some-model'
    },
    {
      path: JSONPath.from(['pets', '*', 'name', 'first']),
      ref: 'some-model'
    },
    {
      path: JSONPath.from(['pets', '*', 'age']),
      ref: 'some-model'
    }
  ];

  expect(indexingResults).toEqual(expectedResults);
});
