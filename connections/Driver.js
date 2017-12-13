const { ObjectId } = require('mongodb');

class Driver {
  constructor(db) {
    this.db = db;
  }

  // TODO: send a 400 error instead of a 500 when a badly formatted ID is received

  getOne(model, id) {
    return this.db.collection(model).findOne({
      _id: ObjectId(id)
    });
  }

  getMany(model, query) {
    return this.db.collection(model).find(query).toArray();
  }

  // TODO: save refs as ObjectID, not as strings. Take a look at how globals are passed around

  create(model, data) {
    return this.db.collection(model).insertOne(data);
  }

  update(model, data, id) {
    let formattedData = {
      $set: data
    };
    return this.db.collection(model).findOneAndUpdate({
      _id: ObjectId(id)
    }, formattedData);
  }

  remove(model, id) {
    return this.db.collection(model).deleteOne({
      _id: ObjectId(id)
    });
  }
}

module.exports = Driver;
