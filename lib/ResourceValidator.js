const Aniame = require('aniame');

const Util = require('./Util');

class ResourceValidator {

  constructor(driver, configHolder) {
    this.driver = driver;
    this.configHolder = configHolder;
  }

  async validate(modelName, resource, enforceRequired) {
    let data = {
      errorPaths: [],
      refCallback: ResourceValidator.validateRef.bind(this),
      enforceRequired
    };
    await Aniame.traverseResource(
      [Aniame.validateNode],
      data,
      resource,
      modelName,
      this.configHolder.schemas
    );
    if (data.errorPaths.length !== 0) {
      let err = new Error('validation');
      err.errorPaths = data.errorPaths;
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
