const Aniame = require('aniame');

const Util = require('./Util');

class ConfigValidator {

  static validateGlobalConfig(config) {
    if (!(config instanceof Object)) {
      throw new Error('Invalid global configuration');
    }
    if (config.parseRequestAsJson === undefined) {
      config.parseRequestAsJson = true;
    }
    if (typeof config.parseRequestAsJson !== 'boolean') {
      throw new Error('Invalid global configuration: parseRequest');
    }
    if (!ConfigValidator.validateHooks(config)) {
      throw new Error('Invalid configuration: hooks');
    }
    if (
      config.errorHandler !== undefined &&
      typeof config.errorHandler !== 'function'
    ) {
      throw new Error('Invalid global configuration: errorHandler');
    }
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
      if (route === 'getOne' || route === 'getMany') {
        for (let hookType of ['willQuery', 'didQuery']) {
          if (!Util.validateFunctionArray(object.hooks[route], hookType)) {
            return false;
          }
        }
      }
      if (route === 'post' || route === 'patch') {
        for (let hookType of [
          'willValidate',
          'didValidateWillWrite',
          'didWrite'
        ]) {
          if (!Util.validateFunctionArray(object.hooks[route], hookType)) {
            return false;
          }
        }
      }
      if (route === 'delete') {
        for (let hookType of ['willDelete', 'didDelete']) {
          if (!Util.validateFunctionArray(object.hooks[route], hookType)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  static validateOptions(model) {
    if (model.options === undefined) {
      model.options = {};
    }
    if (!(model.options instanceof Object)) {
      return false;
    }
    if (
      model.options.errorHandler &&
      typeof model.options.errorHandler !== 'function'
    ) {
      return false;
    }
    return true;
  }

  static validateModel(model, modelName, modelNames) {
    if (!Aniame.validateSchema(model.schema, modelNames)) {
      throw new Error(`Invalid schema for: ${modelName}`);
    }

    if (!ConfigValidator.validateHooks(model)) {
      throw new Error(`Invalid hooks for: ${modelName}`);
    }

    if (!ConfigValidator.validateOptions(model)) {
      throw new Error(`Invalid options for: ${modelName}`);
    }
  }

}

module.exports = ConfigValidator;
