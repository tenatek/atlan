const Driver = require('./Driver');

async function checkNode(
  refIndexes,
  schemas,
  schemaNode,
  dataNode,
  checkRequired,
  db
) {
  // filters out unknown attributes

  if (schemaNode === undefined) {
    return false;
  }

  // first-level validation

  if (typeof schemaNode.type !== 'string') {
    if (dataNode == null || dataNode.constructor !== Object) {
      return false;
    }
    if (checkRequired) {
      for (let key in schemaNode) {
        if (schemaNode[key].required && dataNode[key] === undefined) {
          return false;
        }
      }
    }
    for (let key in dataNode) {
      if (
        !await checkNode(
          refIndexes,
          schemas,
          schemaNode[key],
          dataNode[key],
          checkRequired,
          db
        )
      ) {
        return false;
      }
    }
  } else if (schemaNode.type === 'array') {
    // handles arrays

    if (dataNode == null || dataNode.constructor !== Array) {
      return false;
    }
    for (let element of dataNode) {
      if (
        !await checkNode(
          refIndexes,
          schemas,
          schemaNode.elements,
          element,
          true,
          db
        )
      ) {
        return false;
      }
    }
  } else if (schemaNode.type === 'object') {
    // handles objects

    if (dataNode == null || dataNode.constructor !== Object) {
      return false;
    }
    if (checkRequired) {
      for (let key in schemaNode.children) {
        if (schemaNode.children[key].required && dataNode[key] === undefined) {
          return false;
        }
      }
    }
    for (let key in dataNode) {
      if (
        !await checkNode(
          refIndexes,
          schemas,
          schemaNode.children[key],
          dataNode[key],
          checkRequired,
          db
        )
      ) {
        return false;
      }
    }
  } else if (schemaNode.type === 'ref') {
    // handles references

    if (!await checkRef(refIndexes, schemas, schemaNode.model, dataNode, db)) {
      return false;
    }
  } else if (schemaNode.type === 'file') {
    // handles files

    if (typeof dataNode !== 'string') {
      return false;
    }
  } else if (typeof dataNode !== schemaNode.type) {
    // handles string, number, boolean

    return false;
  }

  return true;
}

async function checkRef(refIndexes, schemas, model, dataNode, db) {
  if (typeof dataNode === 'string') {
    if (
      (await Driver.getNode(
        db,
        model,
        dataNode,
        refIndexes,
        schemas,
        [],
        []
      )) === null
    ) {
      return false;
    }
  } else if (dataNode != null && dataNode.constructor === Object) {
    if (
      !await validateCreateRequest(db, refIndexes, schemas, model, dataNode)
    ) {
      return false;
    }
  } else {
    return false;
  }

  return true;
}

async function validateCreateRequest(db, refIndexes, schemas, model, data) {
  return checkNode(refIndexes, schemas, schemas[model], data, true, db);
}

async function validateUpdateRequest(db, refIndexes, schemas, model, data) {
  return checkNode(refIndexes, schemas, schemas[model], data, false, db);
}

module.exports = { validateCreateRequest, validateUpdateRequest };
