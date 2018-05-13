function attrSearch(params, query, schema) {
  for (let key in params) {
    if (schema[key]) {
      if (typeof params[key] === 'string') {
        query.$and.push({
          [key]: params[key]
        });
      } else if (params[key].constructor === Array) {
        let orArray = [];
        for (let value of params[key]) {
          orArray.push({
            [key]: value
          });
        }
        query.$and.push({
          $or: orArray
        });
      }
    }
  }
}

function textSearch(param, query) {
  query.$text = {
    $search: param
  };
}

function format(params, schema) {
  let query = {
    $and: []
  };
  if (params._search) {
    textSearch(params._search, query);
  }
  attrSearch(params, query, schema);
  if (query.$and.length === 0) {
    delete query.$and;
  }
  return query;
}

// TODO: selective population

function populate(params, schemas) {
  if (!params._populate) {
    return [];
  }
  if (typeof params._populate === 'string' && schemas[params._populate]) {
    return [params._populate];
  }
  let result = [];
  for (let model of params._populate) {
    if (schemas[model]) {
      result.push(model);
    }
  }
  return result;
}

module.exports = { format, populate };
