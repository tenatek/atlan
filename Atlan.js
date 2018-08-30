const express = require('express');
const bodyParser = require('body-parser');

const ConfigHandler = require('./lib/ConfigHandler');
const ConfigValidator = require('./lib/ConfigValidator');
const Driver = require('./lib/Driver');
const QueryBuilder = require('./lib/QueryBuilder');
const ResourceValidator = require('./lib/ResourceValidator');
const Router = require('./lib/Router');
const Util = require('./lib/Util');

class Atlan {

  constructor(database, models, globalConfig) {
    // validate configuration & set defaults
    this.globalConfig = globalConfig;
    if (this.globalConfig === undefined) {
      this.globalConfig = {};
    }
    ConfigValidator.validateGlobalConfig(this.globalConfig);

    // set up the configuration handler
    this.configHandler = new ConfigHandler(
      Object.keys(models),
      this.globalConfig.hooks,
      this.globalConfig.errorHandler
    );

    // set up the driver, query builder, and resource validator
    this.driver = new Driver(database, this.configHandler);
    this.resourceValidator = new ResourceValidator(
      this.driver,
      this.configHandler
    );

    // validate each model and feed it to the configuration handler
    for (let modelName of this.configHandler.modelNames) {
      Util.wrapSchema(models[modelName]);

      ConfigValidator.validateModel(
        models[modelName],
        modelName,
        this.configHandler.modelNames
      );

      this.configHandler.addSchema(modelName, models[modelName].schema);
      this.configHandler.addHooks(modelName, models[modelName].hooks);
      this.configHandler.addErrorHandler(
        modelName,
        models[modelName].errorHandler
      );
    }
  }

  api() {
    let expressRouter = express.Router();
    if (this.globalConfig.parseRequestAsJson) {
      expressRouter.use(bodyParser.json());
    }
    let router = new Router(
      this.driver,
      expressRouter,
      this.configHandler,
      this.resourceValidator
    );
    for (let modelName of this.configHandler.modelNames) {
      router.createRoutes(modelName);
    }
    return expressRouter;
  }

  async create(modelName, resource) {
    await this.resourceValidator.validate(modelName, resource, true);
    return this.driver.insertDoc(modelName, resource);
  }

  retrieve(modelName, idOrQuery) {
    let query;
    let queryBuilder = new QueryBuilder(
      modelName,
      idOrQuery,
      this.configHandler
    );
    if (typeof idOrQuery === 'string') {
      query = Util.wrapId(idOrQuery);
    } else {
      query = queryBuilder.buildQuery();
    }
    return this.driver.getDocs(
      modelName,
      query,
      queryBuilder.buildPopulateQuery(),
      [],
      queryBuilder.buildSortQuery()
    );
  }

  async update(modelName, id, resource) {
    await this.resourceValidator.validate(modelName, resource, false);
    return this.driver.updateDoc(modelName, id, resource);
  }

  delete(modelName, id) {
    return this.driver.deleteDoc(modelName, id);
  }

}

module.exports = Atlan;
