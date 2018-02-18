async function reassignNodes(node, path, cb) {
  if (node !== undefined) {
    if (path.length === 1) {
      if (path[0] === null) {
        for (let i = 0; i < node.length; i += 1) {
          node[i] = await cb(node[i]);
        }
      } else {
        node[path[0]] = await cb(node[path[0]]);
      }
    }
    if (path[0] === null) {
      for (let childNode of node) {
        await reassignNodes(childNode, path.slice(1), cb);
      }
    }
    await reassignNodes(node[path[0]], path.slice(1), cb);
  }
}

function getNodes(node, path) {
  if (node === undefined) {
    return null;
  }
  if (path.length === 0) {
    return [node];
  }
  if (path[0] === null) {
    let resultArray = [];
    for (let i = 0; i < node.length; i += 1) {
      let result = getNodes(node[i], path.slice(1));
      if (result !== null) {
        resultArray = resultArray.concat(result);
      }
    }
    return resultArray;
  }
  return getNodes(node[path[0]], path.slice(1));
}

function checkPossibleKeys(object, possibleKeys) {
  for (let key in object) {
    if (!possibleKeys.includes(key)) return false;
  }
  return true;
}

module.exports = { reassignNodes, getNodes, checkPossibleKeys };
