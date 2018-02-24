const { ObjectId } = require('mongodb');

const Util = require('./Util');
const QueryBuilder = require('./QueryBuilder');

// TODO: send a 400 error instead of a 500 when a badly formatted ID is received
// TODO: group and rename params

async function getNode(db, model, id, indexes, schemas, prevQueries, allowedQueries) {
  // get the node from the database
  let result = await db.collection(model).findOne({
    _id: ObjectId(id)
  });

  // populate referenced nodes
  if (result) {
    // keep track of the query
    prevQueries.push({
      id,
      model
    });

    // populate child nodes
    for (let ref of indexes[model]) {
      await Util.reassignNodes(result, ref.path, (childId) => {
        // determine if the population should proceed
        if (
          Util.includesObject(prevQueries, {
            id: childId,
            model: ref.model
          }) ||
          !allowedQueries.includes(ref.model)
        ) {
          // leave the id in place
          return childId;
        }
        // get the child node
        return getNode(db, ref.model, childId, indexes, schemas, prevQueries, allowedQueries);
      });
    }
  }
  return result;
}

async function getOne(db, model, queryData, indexes, schemas) {
  // get a list of models to populate
  let allowedQueries = QueryBuilder.populate(queryData.params, schemas);

  // run the query recursively
  return getNode(db, model, queryData.id, indexes, schemas, [], allowedQueries);
}

async function getMany(db, model, queryData, indexes, schemas) {
  let query = QueryBuilder.format(queryData.params, schemas[model]);
  let results = await db
    .collection(model)
    .find(query)
    .toArray();
  let allowedQueries = QueryBuilder.populate(queryData.params, schemas);
  if (allowedQueries.length !== 0) {
    for (let result of results) {
      for (let ref of indexes[model]) {
        await Util.reassignNodes(result, ref.path, (id) => {
          return getNode(db, ref.model, id, indexes, schemas, [], allowedQueries);
        });
      }
    }
  }
  return results;
}

// TODO: save refs as ObjectID, not as strings. Take a look at how globals are passed around

async function create(db, model, queryData, indexes) {
  for (let ref of indexes[model]) {
    await Util.reassignNodes(queryData.data, ref.path, (node) => {
      if (node && typeof node !== 'string') {
        return create(db, ref.model, { data: node }, indexes);
      }
      return node;
    });
  }
  let result = await db.collection(model).insertOne(queryData.data);
  return result.insertedId;
}

async function update(db, model, queryData, indexes) {
  for (let ref of indexes[model]) {
    await Util.reassignNodes(queryData.data, ref.path, (node) => {
      if (node && typeof node !== 'string') {
        return create(db, ref.model, { data: node }, indexes);
      }
      return node;
    });
  }
  let formattedData = {
    $set: queryData.data
  };
  return db.collection(model).findOneAndUpdate(
    {
      _id: ObjectId(queryData.id)
    },
    formattedData
  );
}

function remove(db, model, queryData) {
  return db.collection(model).deleteOne({
    _id: ObjectId(queryData.id)
  });
}

module.exports = {
  getOne,
  getMany,
  create,
  update,
  remove
};
