const Util = require('../Util');

exports = {

  validateSchema(schemas, schema) {
    if (schema == null || schema.constructor !== Object) return false;
    for (const key in schema) {
      if (!exports.checkNode(schemas, schema[key])) return false;
    }
    return true;
  },

  checkNode(schemas, schemaNode) {
    if (schemaNode == null || schemaNode.constructor !== Object) return false;

    if (!['string', 'number', 'boolean', 'object', 'array', 'ref'].includes(schemaNode.type)) return false;

    if (typeof schemaNode.required !== 'boolean' && schemaNode.required !== undefined) return false;

    // handles array types

    if (schemaNode.type === 'array') {

      if (!Util.checkPossibleKeys(schemaNode, ['type', 'required', 'elements'])) return false;
      if (!exports.checkNode(schemas, schemaNode.elements)) return false;

    // handles object types

    } else if (schemaNode.type === 'object') {

      if (!Util.checkPossibleKeys(schemaNode, ['type', 'required', 'children'])) return false;
      if (schemaNode.children == null || schemaNode.children.constructor !== Object) return false;
      for (let key in schemaNode.children) {
        if (!exports.checkNode(schemas, schemaNode.children[key])) return false;
      }

    // handles references
    // TODO: what if the ref is many-to-many?

    } else if (schemaNode.type === 'ref') {
      if (!Util.checkPossibleKeys(schemaNode, ['type', 'required', 'model'])) return false;
      if (typeof schemaNode.model !== 'string') return false;
      if (!schemas[schemaNode.model]) return false;

    // handles string, number, boolean types

    } else if (!Util.checkPossibleKeys(schemaNode, ['type', 'required'])) return false;

    return true;
  }

};

module.exports = exports;
