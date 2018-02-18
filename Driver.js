const { ObjectId } = require('mongodb');

const QueryFormatter = require('./QueryFormatter');

// TODO: send a 400 error instead of a 500 when a badly formatted ID is received

function getOne(db, model, queryData) {
  return db.collection(model).findOne({
    _id: ObjectId(queryData.id)
  });
}

function getMany(db, model, queryData) {
  let query = QueryFormatter.format(queryData.params);
  return db
    .collection(model)
    .find(query)
    .toArray();
}

// TODO: save refs as ObjectID, not as strings. Take a look at how globals are passed around

async function create(db, model, queryData) {
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
