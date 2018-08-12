const Aniame = require('aniame');

const SchemaHandler = require('./SchemaHandler');

class DefinitionValidator {

  static validateHooksForRoute(hooksForRoute, hookTypes) {
    for (let hookType of hookTypes) {
      if (hooksForRoute[hookType] === undefined) {
        hooksForRoute[hookType] = [];
      }
      if (!(hooksForRoute[hookType] instanceof Array)) {
        return false;
      }
      for (let item of hooksForRoute[hookType]) {
        if (typeof item !== 'function') {
          return false;
        }
      }
    }
    return true;
  }

  static validateHooks(object) {
    if (object.hooks === undefined) {
      object.hooks = {};
    }
    if (!(object.hooks instanceof Object)) {
      return false;
    }
    for (let route of ['getOne', 'getMany', 'post', 'patch', 'delete']) {
      if (object.hooks[route] === undefined) {
        object.hooks[route] = {};
      }
      if (!(object.hooks[route] instanceof Object)) {
        return false;
      }
      let routeHookValidationResult;
      if (route === 'getOne' || route === 'getMany') {
        routeHookValidationResult = DefinitionValidator.validateHooksForRoute(
          object.hooks[route],
          ['willQuery', 'didQuery']
        );
      }
      if (route === 'post') {
        routeHookValidationResult = DefinitionValidator.validateHooksForRoute(
          object.hooks[route],
          ['willValidate', 'didValidateWillWrite', 'didWrite']
        );
      }
      if (route === 'patch') {
        routeHookValidationResult = DefinitionValidator.validateHooksForRoute(
          object.hooks[route],
          [
            'willQuery',
            'didQueryWillValidate',
            'willValidate',
            'didValidateWillWrite',
            'didWrite'
          ]
        );
      }
      if (route === 'delete') {
        routeHookValidationResult = DefinitionValidator.validateHooksForRoute(
          object.hooks[route],
          ['willQuery', 'didQueryWillDelete', 'willDelete', 'didDelete']
        );
      }
      if (!routeHookValidationResult) {
        return false;
      }
    }
    return true;
  }

  static validateModel(model, modelName, modelNames) {
    if (
      !Aniame.validateSchema(SchemaHandler.wrapSchema(model.schema), modelNames)
    ) {
      throw new Error(`Invalid schema for ${modelName}`);
    }

    if (!DefinitionValidator.validateHooks(model)) {
      throw new Error(`Invalid hooks for ${modelName}`);
    }

    if (model.errorHandler && typeof model.errorHandler !== 'function') {
      throw new Error(`Invalid error handler for ${modelName}`);
    }
  }

}

module.exports = DefinitionValidator;
