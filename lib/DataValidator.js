const Aniame = require('aniame');

const Driver = require('./Driver');
const QueryBuilder = require('./QueryBuilder');

class DataValidator {

  constructor() {
    this.schemas = {};
  }

  addSchema(modelName, schema) {
    this.schemas[modelName] = schema;
  }

  validateInsert(modelName, data) {
    return Aniame.validateData(
      data,
      modelName,
      this.schemas,
      true,
      DataValidator.validateRef
    );
  }

  validateUpdate(modelName, data) {
    return Aniame.validateData(
      data,
      modelName,
      this.schemas,
      false,
      DataValidator.validateRef
    );
  }

  static async validateRef(node, modelName) {
    if (typeof node === 'string') {
      let doc = await Driver.getDocs(
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
