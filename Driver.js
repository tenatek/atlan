const { ObjectId } = require('mongodb');

const QueryFormatter = require('./QueryFormatter');

// TODO: send a 400 error instead of a 500 when a badly formatted ID is received

function getOne(model, queryData) {
  return this.db.collection(model).findOne({
    _id: ObjectId(queryData.id)
  });
}

function getMany(model, queryData) {
  let query = QueryFormatter.format(queryData.params);
  return this.db
    .collection(model)
    .find(query)
    .toArray();
}

// TODO: save refs as ObjectID, not as strings. Take a look at how globals are passed around

async function create(model, queryData) {
  let result = await this.db.collection(model).insertOne(queryData.data);
  return result.insertedId;
}

function update(model, queryData) {
  let formattedData = {
    $set: queryData.data
  };
  return this.db.collection(model).findOneAndUpdate(
    {
      _id: ObjectId(queryData.id)
    },
    formattedData
  );
}

function remove(model, queryData) {
  return this.db.collection(model).deleteOne({
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
