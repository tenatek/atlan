const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const Aniame = require('aniame');

const ConfigParser = require('./lib/ConfigParser');
const Driver = require('./lib/Driver');
const Router = require('./lib/Router');
const DataValidator = require('./lib/DataValidator');
const DefinitionValidator = require('./lib/DefinitionValidator');
const MiddlewareHandler = require('./lib/MiddlewareHandler');

function atlan(database, models, config) {
  let parsedConfig = ConfigParser.parseConfig(config);
  let router = express.Router();
  let driver = new Driver(database);
  let dataValidator = new DataValidator();
  let middlewareHandler = new MiddlewareHandler(
    parsedConfig.hooks,
    parsedConfig.errorHandler
  );

  if (parsedConfig.parseRequest === 'json') {
    router.use(bodyParser.json());
  } else if (parsedConfig.parseRequest === 'formData') {
    router.use(multer().any());
  }

  let modelNames = Object.keys(models);
  for (let modelName of modelNames) {
    DefinitionValidator.validateModel(models[modelName], modelName, modelNames);

    let index = Aniame.indexSchema(models[modelName].schema, ['ref']);
    driver.addIndex(modelName, index);
    dataValidator.addSchema(modelName, models[modelName].schema);
    middlewareHandler.addHooks(modelName, models[modelName].hooks);
    middlewareHandler.addErrorHandler(
      modelName,
      models[modelName].errorHandler
    );

    Router.createRoutes(
      modelName,
      dataValidator,
      middlewareHandler,
      driver,
      router
    );
  }

  return router;
}

module.exports = atlan;
