const { ObjectId } = require('mongodb');

const Util = require('./Util');

// TODO: send a 400 error instead of a 500 when a badly formatted ID is received
// TODO: group and rename params

class Driver {

  constructor(database, configHandler) {
    this.database = database;
    this.configHandler = configHandler;
  }

  async getDocs(
    modelName,
    query,
    modelsToPopulate,
    previousQueries,
    sortParams
  ) {
    // get the documents from the database
    let cursor = this.database.collection(modelName).find(query);
    let docs;

    if (sortParams) {
      docs = await cursor.sort(sortParams).toArray();
    } else {
      docs = await cursor.toArray();
    }

    for (let doc of docs) {
      doc._id = doc._id.toString();
      let currentQueries = previousQueries.slice();
      currentQueries.push(doc._id);
      for (let ref of this.configHandler.schemaIndexes[modelName]) {
        await ref.path.resolve(doc, async refId => {
          if (
            modelsToPopulate.includes(ref.ref) &&
            !previousQueries.includes(refId)
          ) {
            let refDocs = await this.getDocs(
              ref.ref,
              Util.wrapId(refId),
              modelsToPopulate,
              currentQueries
            );
            if (refDocs.length === 0) {
              return null;
            } else {
              return refDocs[0];
            }
          } else {
            return refId.toString();
          }
        });
      }
    }
    return docs;
  }

  // TODO: save refs as ObjectID, not as strings

  async insertDoc(modelName, data) {
    for (let ref of this.configHandler.schemaIndexes[modelName]) {
      await ref.path.resolve(data, async node => {
        if (typeof node === 'string') {
          return ObjectId(node);
        }
        let refId = await this.insertDoc(ref.ref, node);
        return ObjectId(refId);
      });
    }
    let result = await this.database.collection(modelName).insertOne(data);
    return result.insertedId.toString();
  }

  async updateDoc(modelName, id, data) {
    for (let ref of this.configHandler.schemaIndexes[modelName]) {
      await ref.path.resolve(data, async node => {
        if (typeof node === 'string') {
          return ObjectId(node);
        }
        let refId = await this.insertDoc(ref.ref, node);
        return ObjectId(refId);
      });
    }
    return this.database.collection(modelName).updateOne(Util.wrapId(id), {
      $set: data
    });
  }

  deleteDoc(modelName, id) {
    return this.database.collection(modelName).deleteOne(Util.wrapId(id));
  }

}

module.exports = Driver;
