const express = require('express');
const bodyParser = require('body-parser');

const ConfigHolder = require('./lib/ConfigHolder');
const ConfigValidator = require('./lib/ConfigValidator');
const Driver = require('./lib/Driver');
const QueryBuilder = require('./lib/QueryBuilder');
const ResourceValidator = require('./lib/ResourceValidator');
const Router = require('./lib/Router');
const Util = require('./lib/Util');

function atlan(database, models, globalConfig) {
  // validate configuration & set defaults
  let _globalConfig = globalConfig;
  if (_globalConfig === undefined) {
    _globalConfig = {};
  }
  ConfigValidator.validateGlobalConfig(_globalConfig);

  let driver = new Driver(database);
  let configHolder = new ConfigHolder(
    _globalConfig.hooks,
    _globalConfig.errorHandler
  );
  let queryBuilder = new QueryBuilder(configHolder);
  let resourceValidator = new ResourceValidator(configHolder);
  let expressRouter = express.Router();
  let router = new Router(
    driver,
    expressRouter,
    configHolder,
    queryBuilder,
    resourceValidator
  );

  if (_globalConfig.parseRequestAsJson) {
    expressRouter.use(bodyParser.json());
  }

  let modelNames = Object.keys(models);
  for (let modelName of modelNames) {
    Util.wrapSchema(models[modelName]);

    ConfigValidator.validateModel(models[modelName], modelName, modelNames);

    configHolder.addSchema(modelName, models[modelName].schema);
    configHolder.addHooks(modelName, models[modelName].hooks);
    configHolder.addErrorHandler(modelName, models[modelName].errorHandler);

    router.createRoutes(modelName);
  }

  return expressRouter;
}

module.exports = atlan;
