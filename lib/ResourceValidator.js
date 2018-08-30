const Aniame = require('aniame');

const Util = require('./Util');

class ResourceValidator {

  constructor(driver, configHolder) {
    this.driver = driver;
    this.configHolder = configHolder;
  }

  async validate(modelName, resource, enforceRequired) {
    let errorPaths = await Aniame.validateResource(
      resource,
      modelName,
      this.configHolder.schemas,
      enforceRequired,
      ResourceValidator.validateRef.bind(this)
    );
    if (errorPaths.length !== 0) {
      let err = new Error('validation');
      err.errorPaths = errorPaths;
      throw err;
    }
  }

  static async validateRef(node, modelName) {
    if (typeof node === 'string') {
      let [doc] = await this.driver.getDocs(
        modelName,
        Util.wrapId(node),
        [],
        []
      );
      if (doc) {
        return 'valid';
      }
      return 'invalid';
    } else if (node instanceof Object) {
      return 'check';
    }
    return 'invalid';
  }

}

module.exports = ResourceValidator;
