const SchemaValidator = require('../SchemaValidator');

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
          age: {
            type: 'number',
            required: true
          }
        }
      }
    }
  }
};

test('rejects schema nodes that are not objects', () => {
  expect(SchemaValidator.validateSchema(schema, {
    name: 'Tim',
    telephone: 123456,
    email: 'blue',
    test: true
  })).toBe(false);
});

test('"required" is optional', () => {
  expect(SchemaValidator.validateSchema(schema, {
    name: {
      type: 'string'
    },
    telephone: {
      type: 'number'
    },
    email: {
      type: 'string'
    }
  })).toBe(true);
});

test('references work', () => {
  expect(SchemaValidator.validateSchema(schema, {
    name: {
      type: 'ref',
      model: 'person'
    },
    telephone: {
      type: 'number',
      required: true
    },
    email: {
      type: 'string'
    }
  })).toBe(true);
});

test('complex example', () => {
  expect(SchemaValidator.validateSchema(schema, {
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
    friend: {
      type: 'ref',
      model: 'person',
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
          age: {
            type: 'number',
            required: true
          }
        }
      }
    }
  })).toBe(true);
});

test('rejects unknown attributes', () => {
  expect(SchemaValidator.validateSchema(schema, {
    name: {
      type: 'string',
      required: true,
      blue: true
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
          age: {
            type: 'number',
            required: true
          }
        }
      }
    }
  })).toBe(false);
});
