const ConfigValidator = require('../lib/ConfigValidator');
const Util = require('../lib/Util');

let model;
let expectedModel;

function middleware() {}

beforeEach(() => {
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
            capital: {
              type: 'ref',
              ref: 'city',
              required: true
            }
          }
        }
      }
    },
    hooks: {
      getOne: {
        willQuery: [middleware]
      },
      post: {
        didValidateWillWrite: [middleware, middleware]
      },
      patch: {
        didWrite: [middleware]
      }
    },
    options: {
      errorHandler: middleware
    }
  };
  Util.wrapSchema(model);
  expectedModel = {
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
            capital: {
              type: 'ref',
              ref: 'city',
              required: true
            }
          }
        }
      }
    },
    hooks: {
      getOne: {
        willQuery: [middleware],
        didQuery: []
      },
      getMany: {
        willQuery: [],
        didQuery: []
      },
      post: {
        willValidate: [],
        didValidateWillWrite: [middleware, middleware],
        didWrite: []
      },
      patch: {
        willValidate: [],
        didValidateWillWrite: [],
        didWrite: [middleware]
      },
      delete: {
        willDelete: [],
        didDelete: []
      }
    },
    options: {
      errorHandler: middleware
    }
  };
  Util.wrapSchema(expectedModel);
});

test('valid hooks', () => {
  let validationResult = ConfigValidator.validateHooks(model);

  expect.assertions(2);
  expect(validationResult).toBe(true);
  expect(model.hooks).toEqual(expectedModel.hooks);
});

test('invalid hooks', () => {
  model.hooks.getOne.didQuery = {};
  let validationResult = ConfigValidator.validateHooks(model);

  expect.assertions(1);
  expect(validationResult).toBe(false);
});

test('invalid hooks in model', () => {
  model.hooks.getOne.didQuery = {};
  function validateModel() {
    ConfigValidator.validateModel(model, 'jedi', ['jedi', 'city']);
  }

  expect.assertions(1);
  expect(validateModel).toThrow('Invalid hooks for: jedi');
});

test('valid options', () => {
  let validationResult = ConfigValidator.validateOptions(model);

  expect.assertions(2);
  expect(validationResult).toBe(true);
  expect(model.options).toEqual(expectedModel.options);
});

test('invalid options', () => {
  model.options.errorHandler = [];
  let validationResult = ConfigValidator.validateOptions(model);

  expect.assertions(1);
  expect(validationResult).toBe(false);
});

test('invalid options in model', () => {
  model.options.errorHandler = [];
  function validateModel() {
    ConfigValidator.validateModel(model, 'jedi', ['jedi', 'city']);
  }

  expect.assertions(1);
  expect(validateModel).toThrow('Invalid options for: jedi');
});

test('valid model', () => {
  function validateModel() {
    ConfigValidator.validateModel(model, 'jedi', ['jedi', 'city']);
  }

  expect.assertions(1);
  expect(validateModel).not.toThrow();
});
