function index(schema) {
  let resultArray = [];
  for (let key in schema) {
    let result = checkNode(schema[key], [key]);
    if (result !== null) {
      resultArray = resultArray.concat(result);
    }
  }
  return resultArray;
}

function checkNode(node, path) {
  if (node.type === 'array') {
    path.push(null);
    return checkNode(node.elements, path);
  }
  if (node.type === 'object') {
    let resultArray = [];
    for (let key in node.children) {
      let childPath = path.concat(key);
      let result = checkNode(node.children[key], childPath);
      if (result !== null) {
        resultArray = resultArray.concat(result);
      }
    }
    return resultArray;
  }
  if (node.type === 'ref') {
    return {
      path,
      model: node.model
    };
  }
  return null;
}

module.exports = { index };
