const _ = require('lodash');

async function reassignNodes(node, path, cb) {
  if (node !== undefined) {
    if (path.length === 1) {
      if (path[0] === null) {
        for (let i = 0; i < node.length; i += 1) {
          node[i] = await cb(node[i]);
        }
      } else if (node[path[0]]) {
        node[path[0]] = await cb(node[path[0]]);
      }
    } else if (path[0] === null) {
      for (let childNode of node) {
        await reassignNodes(childNode, path.slice(1), cb);
      }
    } else {
      await reassignNodes(node[path[0]], path.slice(1), cb);
    }
  }
}

function includesObject(array, obj) {
  for (let element of array) {
    if (_.isEqual(element, obj)) {
      return true;
    }
  }
  return false;
}

module.exports = { reassignNodes, includesObject };
