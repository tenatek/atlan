const { ObjectId } = require('mongodb');

const QueryBuilder = require('./QueryBuilder');

// TODO: send a 400 error instead of a 500 when a badly formatted ID is received
// TODO: group and rename params

class Driver {

  constructor(database) {
    this.database = database;
    this.indexes = {};
  }

  addIndex(modelName, index) {
    this.indexes[modelName] = index;
  }

  async getDocs(modelName, query, previousQueries, modelsToPopulate) {
    // get the documents from the database
    let docs = await this.database
      .collection(modelName)
      .find(query)
      .toArray();

    for (let doc of docs) {
      doc._id = doc._id.toString();
      let currentQueries = previousQueries.slice();
      currentQueries.push(doc._id);
      if (this.indexes[modelName].ref) {
        for (let ref of this.indexes[modelName].ref) {
          await ref.path.resolve(doc, async refId => {
            if (
              modelsToPopulate.includes(ref.data.ref) &&
              !previousQueries.includes(refId)
            ) {
              let refDocs = await this.getDocs(
                modelName,
                QueryBuilder.wrapId(refId),
                currentQueries,
                modelsToPopulate
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
    }
    return docs;
  }

  // TODO: save refs as ObjectID, not as strings

  async insertDoc(modelName, data) {
    if (this.indexes[modelName].ref) {
      for (let ref of this.indexes[modelName].ref) {
        await ref.path.resolve(data, async node => {
          if (typeof node === 'string') {
            return ObjectId(node);
          }
          let id = await this.insertDoc(ref.data.ref, node);
          return ObjectId(id);
        });
      }
    }
    let result = await this.database.collection(modelName).insertOne(data);
    return result.insertedId;
  }

  async updateDoc(modelName, id, data) {
    if (this.indexes[modelName].ref) {
      for (let ref of this.indexes[modelName].ref) {
        await ref.path.resolve(data, async node => {
          if (typeof node === 'string') {
            return ObjectId(node);
          }
          let refId = await this.insertDoc(ref.data.ref, node);
          return ObjectId(refId);
        });
      }
    }
    return this.database
      .collection(modelName)
      .updateOne(QueryBuilder.wrapId(id), {
        $set: data
      });
  }

  deleteDoc(modelName, id) {
    return this.database
      .collection(modelName)
      .deleteOne(QueryBuilder.wrapId(id));
  }

}

module.exports = Driver;
