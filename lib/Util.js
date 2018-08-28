const { ObjectId } = require('mongodb');

class Util {

  static validateFunctionArray(object, property) {
    if (object[property] === undefined) {
      object[property] = [];
    }
    if (!(object[property] instanceof Array)) {
      return false;
    }
    for (let item of object[property]) {
      if (typeof item !== 'function') {
        return false;
      }
    }
    return true;
  }

  static wrapSchema(model) {
    model.schema = {
      type: 'object',
      properties: model.schema
    };
  }

  static wrapId(id) {
    return {
      _id: ObjectId(id)
    };
  }

}

module.exports = Util;
