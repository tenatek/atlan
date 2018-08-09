const { ObjectId } = require('mongodb');

class QueryBuilder {

  constructor() {
    this.schemas = {};
  }

  addSchema(modelName, schema) {
    this.schemas[modelName] = schema;
  }

  parseUrlQueryValue(modelName, field, value) {
    if (
      this.schemas[modelName][field] &&
      this.schemas[modelName][field].type === 'number'
    ) {
      return parseInt(value, 10);
    }
    if (
      this.schemas[modelName][field] &&
      this.schemas[modelName][field].type === 'boolean'
    ) {
      return value === 'true';
    }
    return value;
  }

  buildQuery(modelName, urlQuery) {
    let mongoQuery = [];
    this.buildFieldQuery(modelName, urlQuery, mongoQuery);
    QueryBuilder.buildTextQuery(urlQuery, mongoQuery);
    if (mongoQuery.length !== 0) {
      return { $and: mongoQuery };
    }
    return {};
  }

  buildFieldQuery(modelName, urlQuery, mongoQuery) {
    for (let field in urlQuery) {
      if (field.substr(0, 1) !== '_') {
        if (urlQuery[field] instanceof Array) {
          let possibleFieldValues = urlQuery[field].map(value => {
            return {
              [field]: this.parseUrlQueryValue(modelName, field, value)
            };
          });
          mongoQuery.push({
            $or: possibleFieldValues
          });
        } else {
          mongoQuery.push({
            [field]: this.parseUrlQueryValue(modelName, field, urlQuery[field])
          });
        }
      }
    }
  }

  static buildTextQuery(urlQuery, mongoQuery) {
    if (urlQuery._search) {
      mongoQuery.push({
        $text: {
          $search: urlQuery._search
        }
      });
    }
  }

  static getModelsToPopulate(urlQuery) {
    if (typeof urlQuery._populate === 'string') {
      return [urlQuery._populate];
    }
    if (urlQuery._populate instanceof Array) {
      return urlQuery._populate;
    }
    return [];
  }

  static wrapId(id) {
    return {
      _id: ObjectId(id)
    };
  }

}

module.exports = QueryBuilder;
