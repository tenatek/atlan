const Aniame = require('aniame');

const QueryBuilder = require('./QueryBuilder');

class DataValidator {

  constructor(driver) {
    this.driver = driver;
    this.schemas = {};
  }

  addSchema(modelName, schema) {
    this.schemas[modelName] = schema;
  }

  async validateInsert(modelName, data) {
    let errorPaths = await Aniame.validateResource(
      data,
      modelName,
      this.schemas,
      true,
      DataValidator.validateRef.bind(this)
    );
    if (errorPaths.length !== 0) {
      let err = new Error('validation');
      err.errorPaths = errorPaths;
      throw err;
    }
  }

  async validateUpdate(modelName, data) {
    let errorPaths = await Aniame.validateResource(
      data,
      modelName,
      this.schemas,
      false,
      DataValidator.validateRef.bind(this)
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
        QueryBuilder.wrapId(node),
        [],
        []
      );
      if (doc) {
        return true;
      }
      return false;
    } else if (node instanceof Object) {
      return null;
    }
    return false;
  }

}

module.exports = DataValidator;
