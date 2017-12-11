const validate = require('../package/schemaValidation')

const schema = {
  'Test': {
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
}

test('rejects schema nodes that are not objects', () => {
  expect(validate.validateSchema(schema, {
    name: 'Tim',
    telephone: 123456,
    email: 'blue',
    test: true
  })).toBe(false)
})

test('"required" is optional', () => {
  expect(validate.validateSchema(schema, {
    name: {
      type: 'string'
    },
    telephone: {
      type: 'number'
    },
    email: {
      type: 'string'
    }
  })).toBe(true)
})

test('references work', () => {
  expect(validate.validateSchema(schema, {
    name: {
      type: 'ref',
      model: 'Test'
    },
    telephone: {
      type: 'number',
      required: true
    },
    email: {
      type: 'string'
    }
  })).toBe(true)
})

test('complex example', () => {
  expect(validate.validateSchema(schema, {
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
  })).toBe(true)
})

test('rejects unknown attributes', () => {
  expect(validate.validateSchema(schema, {
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
  })).toBe(false)
})
