const Aniame = require('aniame');

const Driver = require('./Driver');
const QueryBuilder = require('./QueryBuilder');
const ValidationError = require('./ValidationError');

class DataValidator {

  constructor() {
    this.schemas = {};
  }

  addSchema(modelName, schema) {
    this.schemas[modelName] = schema;
  }

  async validateInsert(modelName, data) {
    let validationResult = await Aniame.validateData(
      data,
      modelName,
      this.schemas,
      true,
      DataValidator.validateRef
    );
    if (!validationResult.success) {
      throw new ValidationError('Validation failed.', validationResult);
    }
  }

  async validateUpdate(modelName, data) {
    let validationResult = await Aniame.validateData(
      data,
      modelName,
      this.schemas,
      false,
      DataValidator.validateRef
    );
    if (!validationResult.success) {
      throw new ValidationError('Validation failed.', validationResult);
    }
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
