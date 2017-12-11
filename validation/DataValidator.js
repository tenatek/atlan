const Util = require('../Util');

exports = {

  async validateCreateRequest(schemas, model, data) {
    return exports.checkNode(schemas, model, data, true, this.d);
  },

  async validateUpdateRequest(schemas, model, data) {
    return exports.checkNode(schemas, model, data, false, this.d);
  },

  async checkNode(schemas, schemaPath, dataNode, checkRequired, driver) {
    let schemaNode = Util.getNodeFromPath(schemas, schemaPath);

    // filters out unknown attributes

    if (schemaNode === undefined) return false;

    // first-level validation

    if (typeof schemaNode.type !== 'string') {
      if (dataNode == null || dataNode.constructor !== Object) return false;
      if (checkRequired) {
        for (let key in schemaNode) {
          if (schemaNode[key].required && dataNode[key] === undefined) return false;
        }
      }
      for (let key in dataNode) {
        if (!(await exports.checkNode(schemas, `${schemaPath}/${key}`, dataNode[key], checkRequired))) return false;
      }

    // handles arrays

    } else if (schemaNode.type === 'array') {
      if (dataNode == null || dataNode.constructor !== Array) return false;
      for (let element of dataNode) {
        if (!(await exports.checkNode(schemas, `${schemaPath}/elements`, element, true))) return false;
      }

    // handles objects

    } else if (schemaNode.type === 'object') {
      if (dataNode == null || dataNode.constructor !== Object) return false;
      if (checkRequired) {
        for (let key in schemaNode.children) {
          if (schemaNode.children[key].required && dataNode[key] === undefined) return false;
        }
      }
      for (let key in dataNode) {
        if (!(await exports.checkNode(schemas, `${schemaPath}/children/${key}`, dataNode[key], checkRequired))) return false;
      }

    // handles references

    } else if (schemaNode.type === 'ref') {
      if (!(await exports.checkRef(schemas, schemaNode.model, dataNode, driver))) return false;

    // handles string, number, boolean

    } else if (typeof dataNode !== schemaNode.type) return false;

    return true;
  },

  async checkRef(schemas, model, dataNode, driver) {
    if (typeof dataNode === 'string') {
      if ((await driver.getOne(dataNode)) === null) return false;
    } else if (dataNode != null && dataNode.constructor === Object) {
      if (!(await exports.validateCreateRequest(schemas, model, dataNode))) return false;
    } else return false;

    return true;
  }

};

module.exports = exports;
