const { ObjectId } = require('mongodb');

class QueryBuilder {

  static buildFieldQuery(urlQuery, mongoQuery) {
    for (let field in urlQuery) {
      if (field.substr(0, 1) !== '_') {
        if (urlQuery[field] instanceof Array) {
          let possibleFieldValues = urlQuery[field].map(value => {
            return {
              [field]: value
            };
          });
          mongoQuery.push({
            $or: possibleFieldValues
          });
        } else {
          mongoQuery.push({
            [field]: urlQuery[field]
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

  static buildQuery(urlQuery) {
    let mongoQuery = [];
    QueryBuilder.buildFieldQuery(urlQuery, mongoQuery);
    QueryBuilder.buildTextQuery(urlQuery, mongoQuery);
    if (mongoQuery.length !== 0) {
      return { $and: mongoQuery };
    }
    return {};
  }

  // TODO: selective population

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
