const Driver = require('./Driver');

async function checkNode(schemas, schemaNode, dataNode, checkRequired, db) {
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
      if (!await checkNode(schemas, schemaNode[key], dataNode[key], checkRequired, db)) {
        return false;
      }
    }

    // handles arrays
  } else if (schemaNode.type === 'array') {
    if (dataNode == null || dataNode.constructor !== Array) return false;
    for (let element of dataNode) {
      if (!await checkNode(schemas, schemaNode.elements, element, true, db)) {
        return false;
      }
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
      if (!await checkNode(schemas, schemaNode.children[key], dataNode[key], checkRequired, db)) {
        return false;
      }
    }

    // handles references
  } else if (schemaNode.type === 'ref') {
    if (!await checkRef(schemas, schemaNode.model, dataNode, db)) return false;

    // handles string, number, boolean
  } else if (typeof dataNode !== schemaNode.type) return false;

  return true;
}

// TODO: change the getOne API to remove the object construction?

async function checkRef(schemas, model, dataNode, db) {
  if (typeof dataNode === 'string') {
    if ((await Driver.getOne(db, model, { id: dataNode })) === null) {
      return false;
    }
  } else if (dataNode != null && dataNode.constructor === Object) {
    if (!await validateCreateRequest(db, schemas, model, dataNode)) {
      return false;
    }
  } else {
    return false;
  }

  return true;
}

async function validateCreateRequest(db, schemas, model, data) {
  return checkNode(schemas, schemas[model], data, true, db);
}

async function validateUpdateRequest(db, schemas, model, data) {
  return checkNode(schemas, schemas[model], data, false, db);
}

module.exports = { validateCreateRequest, validateUpdateRequest };
