const { ObjectId } = require('mongodb');

const Util = require('./Util');
const QueryFormatter = require('./QueryFormatter');

// TODO: send a 400 error instead of a 500 when a badly formatted ID is received

async function getOne(db, model, queryData, indexes) {
  let result = await db.collection(model).findOne({
    _id: ObjectId(queryData.id)
  });
  if (result && indexes) {
    for (let ref of indexes[model]) {
      await Util.reassignNodes(result, ref.path, (id) => {
        return getOne(db, ref.model, { id });
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
          return getOne(db, ref.model, { id });
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
    let nodes = Util.getNodes(queryData.data, ref.path);
    if (nodes) {
      for (let node of nodes) {
        if (node && typeof node !== 'string') {
          let result = await create(db, ref.model, { data: node }, indexes);
          await Util.reassignNodes(queryData.data, ref.path, () => {
            return result;
          });
        }
      }
    }
  }
  let result = await db.collection(model).insertOne(queryData.data);
  return result.insertedId;
}

function update(db, model, queryData) {
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
