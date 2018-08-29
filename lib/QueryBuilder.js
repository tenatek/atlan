const { ObjectId } = require('mongodb');

class QueryBuilder {

  constructor(configHolder) {
    this.configHolder = configHolder;
  }

  parseUrlQueryProperty(modelName, property, value) {
    let field = property.split('_')[0];
    let operator = property.split('_')[1];
    if (this.configHolder.schemas[modelName].properties[field]) {
      if (
        this.configHolder.schemas[modelName].properties[field].type === 'number'
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
        this.configHolder.schemas[modelName].properties[field].type ===
        'boolean'
      ) {
        return {
          [field]: value === 'true'
        };
      }
      if (
        this.configHolder.schemas[modelName].properties[field].type === 'ref'
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
    for (let property in urlQuery) {
      if (property.substr(0, 1) !== '_') {
        if (urlQuery[property] instanceof Array) {
          let possibleFieldValues = urlQuery[property].map(value => {
            return this.parseUrlQueryProperty(modelName, property, value);
          });
          mongoQuery.push({
            $or: possibleFieldValues
          });
        } else {
          mongoQuery.push(
            this.parseUrlQueryProperty(modelName, property, urlQuery[property])
          );
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

  static buildSortQuery(urlQuery) {
    if (typeof urlQuery._sort === 'string') {
      if (urlQuery._order === 'desc') {
        return { [urlQuery._sort]: -1 };
      }
      return { [urlQuery._sort]: 1 };
    }
  }

}

module.exports = QueryBuilder;
