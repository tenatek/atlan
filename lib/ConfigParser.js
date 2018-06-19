const DefinitionValidator = require('./DefinitionValidator');

class ConfigParser {

  static parseConfig(config) {
    if (config === undefined) {
      config = {};
    }
    if (config.parseRequest === undefined) {
      config.parseRequest = 'json';
    }
    if (!['json', 'formData', null].includes(config.parseRequest)) {
      throw new Error('Invalid configuration: parseRequest');
    }
    if (!DefinitionValidator.validateHooks(config)) {
      throw new Error('Invalid configuration: hooks');
    }
    if (
      config.errorHandler !== undefined &&
      typeof config.errorHandler !== 'function'
    ) {
      throw new Error('Invalid configuration: errorHandler');
    }
    return config;
  }

}

module.exports = ConfigParser;
