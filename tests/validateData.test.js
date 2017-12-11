const validate = require('../package/dataValidation')

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
            type: 'ref',
            model: 'TestRef',
            required: true
          }
        }
      }
    }
  },
  'TestRef': {
    name: {
      type: 'string',
      required: true
    },
    attr: {
      type: 'number',
      required: true
    }
  }
}

test('rejects unknown attributes', () => {
  return expect(validate.validateCreateRequest(schema, 'Test', {
    name: 'Tim',
    telephone: 123456,
    email: 'blue',
    test: true
  })).resolves.toBe(false)
})

test('ignores optional attributes', () => {
  return expect(validate.validateCreateRequest(schema, 'Test', {
    name: 'Tim',
    email: 'blue'
  })).resolves.toBe(true)
})

test('enforces required attributes', () => {
  return expect(validate.validateCreateRequest(schema, 'Test', {
    name: 'true',
    telephone: 534
  })).resolves.toBe(false)
})

test('checks attribute types', () => {
  return expect(validate.validateCreateRequest(schema, 'Test', {
    name: 'true',
    telephone: '534',
    email: 'test'
  })).resolves.toBe(false)
})

test('checks array element types', () => {
  return expect(validate.validateCreateRequest(schema, 'Test', {
    name: 'true',
    telephone: 534,
    email: 'test',
    pets: [{
      age: {
        name: 'Bob'
      },
      name: {
        first: 'tom'
      }
    }]
  })).resolves.toBe(false)
})
