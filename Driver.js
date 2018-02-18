const { ObjectId } = require('mongodb');

const Util = require('./Util');
const QueryFormatter = require('./QueryFormatter');

// TODO: send a 400 error instead of a 500 when a badly formatted ID is received

async function getOne(db, model, queryData, indexes, prevQueries) {
  let result = await db.collection(model).findOne({
    _id: ObjectId(queryData.id)
  });
  if (!prevQueries) {
    prevQueries = [];
  }
  prevQueries.push({
    id: queryData.id,
    model
  });
  if (result && indexes) {
    for (let ref of indexes[model]) {
      await Util.reassignNodes(result, ref.path, (id) => {
        if (
          Util.includesObject(prevQueries, {
            id,
            model: ref.model
          })
        ) {
          return id;
        }
        return getOne(db, ref.model, { id }, indexes, prevQueries);
      });
    }
  }
  return result;
}

async function getMany(db, model, queryData, indexes) {
  let query = QueryFormatter.format(queryData.params);
  let results = await db
    .collection(model)
    .find(query)
    .toArray();
  if (indexes) {
    for (let result of results) {
      for (let ref of indexes[model]) {
        await Util.reassignNodes(result, ref.path, (id) => {
          return getOne(db, ref.model, { id }, indexes);
        });
      }
    }
  }
  return results;
}

// TODO: save refs as ObjectID, not as strings. Take a look at how globals are passed around
// TODO: right now it is assigning the same ID to all objects in the array

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
