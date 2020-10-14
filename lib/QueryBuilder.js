const { ObjectId } = require('mongodb');
const {JSONPath} = require('acamani');

class QueryBuilder {

  constructor(modelName, queryObject, configHandler) {
    this.modelName = modelName;
    this.queryObject = queryObject;
    this.configHandler = configHandler;
  }

  async buildFieldQuery(property, value) {
    let field = property.split('_')[0];
    let operator = property.split('_')[1];
    let path = JSONPath.from(field.split('.').join('.properties.').split('.'));
    let descriptor = await path.resolve(this.configHandler.schemas[this.modelName].properties);
    if (descriptor[0]) {
      if (
        descriptor[0].type ===
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
        descriptor[0].type ===
        'boolean'
      ) {
        return {
          [field]: value === 'true' || value === true
        };
      }
      if (
        descriptor[0].type ===
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

  async buildQuery() {
    let mongoQuery = [];
    for (let property in this.queryObject) {
      if (property.substr(0, 1) !== '_') {
        if (this.queryObject[property] instanceof Array) {
          let possibleFieldValues = await Promise.all(this.queryObject[property].map(value => {
            return this.buildFieldQuery(property, value);
          }));
          mongoQuery.push({
            $or: possibleFieldValues
          });
        } else {
          mongoQuery.push(
            await this.buildFieldQuery(property, this.queryObject[property])
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
