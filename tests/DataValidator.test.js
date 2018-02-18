const DataValidator = require('../DataValidator');

const schema = {
  person: {
    name: {
      type: 'string',
      required: true
    },
    telephone: {
      type: 'number'
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
                type: 'string',
                required: true
              },
              family: {
                type: 'string'
              }
            },
            required: true
          },
          race: {
            type: 'ref',
            model: 'race',
            required: true
          }
        }
      }
    }
  },
  race: {
    name: {
      type: 'string',
      required: true
    },
    classification: {
      type: 'number',
      required: true
    }
  }
};

test('rejects unknown attributes', () => {
  expect(DataValidator.validateCreateRequest(null, schema, 'person', {
    name: 'Tim',
    telephone: 123456,
    email: 'blue',
    test: true
  })).resolves.toBe(false);
});

test('ignores optional attributes', () => {
  expect(DataValidator.validateCreateRequest(null, schema, 'person', {
    name: 'Tim',
    email: 'blue'
  })).resolves.toBe(true);
});

test('enforces required attributes', () => {
  expect(DataValidator.validateCreateRequest(null, schema, 'person', {
    name: 'true',
    telephone: 534
  })).resolves.toBe(false);
});

test('checks attribute types', () => {
  expect(DataValidator.validateCreateRequest(null, schema, 'person', {
    name: 'true',
    telephone: '534',
    email: 'test'
  })).resolves.toBe(false);
});

test('checks array element types', () => {
  expect(DataValidator.validateCreateRequest(null, schema, 'person', {
    name: 'true',
    telephone: 534,
    email: 'test',
    pets: [
      {
        age: {
          name: 'Bob'
        },
        name: {
          first: 'tom'
        }
      }
    ]
  })).resolves.toBe(false);
});
