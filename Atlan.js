const express = require('express');
const Aniame = require('aniame');

const Driver = require('./lib/Driver');
const Router = require('./lib/Router');
const DataValidator = require('./lib/DataValidator');
const HookValidator = require('./lib/HookValidator');

/**
 *
 * @param {*} database
 * @param {*} models
 * @param {{parseJson: boolean}} config
 */
function atlan(database, models) {
  let router = express.Router();
  let driver = new Driver(database);
  let dataValidator = new DataValidator();

  let modelNames = Object.keys(models);
  for (let modelName of modelNames) {
    if (!Aniame.validateSchema(models[modelName].schema, modelNames)) {
      throw new Error(`Invalid schema: ${modelName}.`);
    }
    dataValidator.addSchema(modelName, models[modelName].schema);

    if (!HookValidator.validateHooks(models[modelName])) {
      throw new Error(`Invalid hooks: ${modelName}.`);
    }

    let index = Aniame.indexSchema(models[modelName].schema, ['ref']);
    driver.addIndex(modelName, index);

    Router.createRoutes(
      models[modelName],
      modelName,
      dataValidator,
      driver,
      router
    );
  }

  return router;
}

module.exports = atlan;
