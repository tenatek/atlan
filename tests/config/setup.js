const MongodbMemoryServer = require('mongodb-memory-server');

module.exports = function() {
  global.__MONGOD__ = new MongodbMemoryServer.default({
    instance: {
      dbName: 'atlan'
    },
    binary: {
      version: '3.2.19'
    }
  });
  global.__MONGO_DB_NAME__ = 'atlan';
};
