function attrSearch(params, query, schema) {
  for (let key in params) {
    if (schema[key]) {
      query[key] = params[key];
    }
  }
}

function textSearch(param, query) {
  query.$text = {
    $search: param
  };
}

function format(params, schema) {
  let query = {};
  if (params._search) textSearch(params._search, query);
  attrSearch(params, query, schema);
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
