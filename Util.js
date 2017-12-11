module.exports = {

  getNodeFromPath(object, path) {
    let pathSegments = path.split('/');
    let node = object;
    for (let segment of pathSegments) {
      node = node[segment];
    }
    return node;
  },

  checkPossibleKeys(object, possibleKeys) {
    for (let key in object) {
      if (!possibleKeys.includes(key)) return false;
    }
    return true;
  }

};
