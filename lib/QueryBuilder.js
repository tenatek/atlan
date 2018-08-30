const { ObjectId } = require('mongodb');

class QueryBuilder {

  constructor(modelName, queryObject, configHandler) {
    this.modelName = modelName;
    this.queryObject = queryObject;
    this.configHandler = configHandler;
  }

  buildFieldQuery(property, value) {
    let field = property.split('_')[0];
    let operator = property.split('_')[1];
    if (this.configHandler.schemas[this.modelName].properties[field]) {
      if (
        this.configHandler.schemas[this.modelName].properties[field].type ===
        'number'
      ) {
        if (['gte', 'gt', 'lte', 'lt', 'ne'].includes(operator)) {
          return {
            [field]: {
              [`$${operator}`]: parseInt(value, 10)
            }
          };
        } else {
          return {
            [field]: parseInt(value, 10)
          };
        }
      }
      if (
        this.configHandler.schemas[this.modelName].properties[field].type ===
        'boolean'
      ) {
        return {
          [field]: value === 'true'
        };
      }
      if (
        this.configHandler.schemas[this.modelName].properties[field].type ===
        'ref'
      ) {
        return {
          [field]: ObjectId(value)
        };
      }
    }
    return {
      [field]: value
    };
  }

  buildQuery() {
    let mongoQuery = [];
    for (let property in this.queryObject) {
      if (property.substr(0, 1) !== '_') {
        if (this.queryObject[property] instanceof Array) {
          let possibleFieldValues = this.queryObject[property].map(value => {
            return this.buildFieldQuery(property, value);
          });
          mongoQuery.push({
            $or: possibleFieldValues
          });
        } else {
          mongoQuery.push(
            this.buildFieldQuery(property, this.queryObject[property])
          );
        }
      }
    }
    if (this.queryObject._search) {
      mongoQuery.push({
        $text: {
          $search: this.queryObject._search
        }
      });
    }
    if (mongoQuery.length !== 0) {
      return { $and: mongoQuery };
    }
    return {};
  }

  buildPopulateQuery() {
    if (typeof this.queryObject._populate === 'string') {
      return [this.queryObject._populate];
    }
    if (this.queryObject._populate instanceof Array) {
      return this.queryObject._populate;
    }
    return [];
  }

  buildSortQuery() {
    if (typeof this.queryObject._sort === 'string') {
      if (this.queryObject._order === 'desc') {
        return { [this.queryObject._sort]: -1 };
      }
      return { [this.queryObject._sort]: 1 };
    }
  }

}

module.exports = QueryBuilder;
