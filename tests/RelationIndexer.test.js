const RelationIndexer = require('../RelationIndexer');

const schema = {
  name: {
    type: 'string',
    required: true
  },
  telephone: {
    type: 'ref',
    model: 'some-model'
  },
  email: {
    type: 'string',
    required: true
  },
  pets: {
    type: 'array',
    elements: {
      type: 'object',
      children: {
        name: {
          type: 'object',
          children: {
            first: {
              type: 'ref',
              model: 'some-model',
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
          model: 'some-model',
          required: true
        }
      }
    }
  }
};

test('get correct relation paths', () => {
  expect(RelationIndexer.index(schema)).toEqual([
    { path: ['telephone'], model: 'some-model' },
    { path: ['pets', null, 'name', 'first'], model: 'some-model' },
    { path: ['pets', null, 'age'], model: 'some-model' }
  ]);
});
