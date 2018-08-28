const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const ConfigParser = require('./lib/ConfigParser');
const DataValidator = require('./lib/DataValidator');
const DefinitionValidator = require('./lib/DefinitionValidator');
const Driver = require('./lib/Driver');
const MiddlewareHandler = require('./lib/MiddlewareHandler');
const QueryBuilder = require('./lib/QueryBuilder');
const Router = require('./lib/Router');
const SchemaIndexer = require('./lib/SchemaIndexer');
const Util = require('./lib/Util');

function atlan(database, models, config) {
  let parsedConfig = ConfigParser.parseConfig(config);

  let driver = new Driver(database);
  let dataValidator = new DataValidator(driver);
  let middlewareHandler = new MiddlewareHandler(
    parsedConfig.hooks,
    parsedConfig.errorHandler
  );
  let queryBuilder = new QueryBuilder();
  let router = express.Router();

  if (parsedConfig.parseRequest === 'json') {
    router.use(bodyParser.json());
  } else if (parsedConfig.parseRequest === 'formData') {
    router.use(multer().any());
  }

  let modelNames = Object.keys(models);
  for (let modelName of modelNames) {
    Util.wrapSchema(models[modelName]);
    DefinitionValidator.validateModel(models[modelName], modelName, modelNames);

    let index = SchemaIndexer.indexSchema(models[modelName].schema);

    driver.addIndex(modelName, index);
    dataValidator.addSchema(modelName, models[modelName].schema);
    queryBuilder.addSchema(modelName, models[modelName].schema);
    middlewareHandler.addHooks(modelName, models[modelName].hooks);
    middlewareHandler.addErrorHandler(
      modelName,
      models[modelName].errorHandler
    );

    Router.createRoutes(
      modelName,
      dataValidator,
      middlewareHandler,
      queryBuilder,
      driver,
      router
    );
  }

  return router;
}

module.exports = atlan;
