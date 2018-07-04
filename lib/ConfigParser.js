const DefinitionValidator = require('./DefinitionValidator');

class ConfigParser {

  static parseConfig(config) {
    let parsedConfig = config;

    if (parsedConfig === undefined) {
      parsedConfig = {};
    }

    if (parsedConfig.parseRequest === undefined) {
      parsedConfig.parseRequest = 'json';
    }
    if (!['json', 'formData', null].includes(parsedConfig.parseRequest)) {
      throw new Error('Invalid configuration: parseRequest');
    }

    if (!DefinitionValidator.validateHooks(parsedConfig)) {
      throw new Error('Invalid configuration: hooks');
    }

    if (
      parsedConfig.errorHandler !== undefined &&
      typeof parsedConfig.errorHandler !== 'function'
    ) {
      throw new Error('Invalid configuration: errorHandler');
    }

    return parsedConfig;
  }

}

module.exports = ConfigParser;
