const Util = require('./Util');

function validateSchema(schemas, schema, pendingModels) {
  if (schema == null || schema.constructor !== Object) {
    // check that the schema in an object
    return false;
  }
  for (let key in schema) {
    // check every top-level node of the schema
    if (!checkNode(schemas, schema[key], pendingModels)) {
      return false;
    }
  }
  return true;
}

function checkNode(schemas, schemaNode, pendingModels) {
  if (schemaNode == null || schemaNode.constructor !== Object) {
    // check that the node is an object
    return false;
  }

  if (
    !['string', 'number', 'boolean', 'object', 'array', 'ref', 'file'].includes(schemaNode.type)
  ) {
    // check that the node has a known type
    return false;
  }

  if (typeof schemaNode.required !== 'boolean' && schemaNode.required !== undefined) {
    // if the 'required' property is present, check that it is a boolean
    return false;
  }

  // do validation based on the node type

  if (schemaNode.type === 'array') {
    // handles array types

    if (!Util.checkPossibleKeys(schemaNode, ['type', 'required', 'elements'])) {
      // check that the node has only permitted keys
      return false;
    }
    if (!checkNode(schemas, schemaNode.elements, pendingModels)) {
      // check members of the array
      return false;
    }
  } else if (schemaNode.type === 'object') {
    // handles object types

    if (!Util.checkPossibleKeys(schemaNode, ['type', 'required', 'children'])) {
      // check that the node has only permitted keys
      return false;
    }
    if (schemaNode.children == null || schemaNode.children.constructor !== Object) {
      // check that the 'children' property is an object
      return false;
    }
    for (let key in schemaNode.children) {
      // check children of the object
      if (!checkNode(schemas, schemaNode.children[key], pendingModels)) {
        return false;
      }
    }
  } else if (schemaNode.type === 'ref') {
    // handles references

    if (!Util.checkPossibleKeys(schemaNode, ['type', 'required', 'model'])) {
      // check that the node has only permitted keys
      return false;
    }
    if (typeof schemaNode.model !== 'string') {
      // check that the 'model' property is a string
      return false;
    }
    if (!schemas[schemaNode.model] && !pendingModels.includes(schemaNode.model)) {
      // check that the referenced model is either part of the schema or pending
      return false;
    }
  } else if (!Util.checkPossibleKeys(schemaNode, ['type', 'required'])) {
    // handles string, number, boolean types
    return false;
  }

  return true;
}

module.exports = { validateSchema };
