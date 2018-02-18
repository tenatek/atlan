const Util = require('./Util');

function validateSchema(schemas, schema, pendingModels) {
  if (schema == null || schema.constructor !== Object) return false;
  for (let key in schema) {
    if (!checkNode(schemas, schema[key], pendingModels)) return false;
  }
  return true;
}

function checkNode(schemas, schemaNode, pendingModels) {
  if (schemaNode == null || schemaNode.constructor !== Object) return false;

  if (!['string', 'number', 'boolean', 'object', 'array', 'ref'].includes(schemaNode.type)) {
    return false;
  }

  if (typeof schemaNode.required !== 'boolean' && schemaNode.required !== undefined) return false;

  // handles array types

  if (schemaNode.type === 'array') {
    if (!Util.checkPossibleKeys(schemaNode, ['type', 'required', 'elements'])) return false;
    if (!checkNode(schemas, schemaNode.elements, pendingModels)) return false;

    // handles object types
  } else if (schemaNode.type === 'object') {
    if (!Util.checkPossibleKeys(schemaNode, ['type', 'required', 'children'])) return false;
    if (schemaNode.children == null || schemaNode.children.constructor !== Object) return false;
    for (let key in schemaNode.children) {
      if (!checkNode(schemas, schemaNode.children[key], pendingModels)) return false;
    }

    // handles references
  } else if (schemaNode.type === 'ref') {
    if (!Util.checkPossibleKeys(schemaNode, ['type', 'required', 'model'])) return false;
    if (typeof schemaNode.model !== 'string') return false;
    if (!schemas[schemaNode.model] && !pendingModels.includes(schemaNode.model)) return false;

    // handles string, number, boolean types
  } else if (!Util.checkPossibleKeys(schemaNode, ['type', 'required'])) return false;

  return true;
}

module.exports = { validateSchema };
