function index(schema, type, metadata) {
  let resultArray = [];
  for (let key in schema) {
    let result = checkNode(type, schema[key], [key], metadata);
    if (result !== null) {
      resultArray = resultArray.concat(result);
    }
  }
  return resultArray;
}

function checkNode(type, node, path, metadata) {
  if (node.type === 'array') {
    path.push(null);
    return checkNode(type, node.elements, path, metadata);
  }
  if (node.type === 'object') {
    let resultArray = [];
    for (let key in node.children) {
      let childPath = path.concat(key);
      let result = checkNode(type, node.children[key], childPath, metadata);
      if (result !== null) {
        resultArray = resultArray.concat(result);
      }
    }
    return resultArray;
  }
  if (node.type === type) {
    let result = { path };
    for (let element of metadata) {
      result[element] = node[element];
    }
    return result;
  }
  return null;
}

module.exports = { index };
