const express = require('express');
const bodyParser = require('body-parser');

const SchemaValidator = require('./SchemaValidator');
const HookValidator = require('./HookValidator');
const Router = require('./Router');

class Atlan {
  constructor() {
    this.r = express.Router();
    this.d = null;
    this.schemas = {};
    this.hooks = {};

    // add JSON-parsing middleware to all routes

    this.r.use(bodyParser.json());
  }

  driver(err, db) {
    if (err) throw new Error('Error establishing a database connection.');
    else this.d = db;
  }

  router() {
    return this.r;
  }

  model(...args) {
    // parse params

    let modelArray;
    if (args.length === 2) modelArray = [args];
    else [modelArray] = args;

    // get names of pending models for schema cross-ref validation

    let pendingModels = [];
    for (let model of modelArray) {
      pendingModels.push(model[0]);
    }

    // process models

    for (let model of modelArray) {
      let [name, definition] = model;
      let { schema, hooks } = definition;

      // add schema to schema store

      if (
        !this.schemas[name] &&
        SchemaValidator.validateSchema(this.schemas, schema, pendingModels)
      ) {
        this.schemas[name] = schema;
      } else throw new Error('Invalid schema.');

      // add hooks to hook store

      if (hooks) {
        if (HookValidator.validateHooks(hooks)) this.hooks[name] = hooks;
        else throw new Error('Invalid hooks.');
      }

      // add routes to router

      Router.addRoutes(this.r, name, hooks, this.schemas);
    }
  }
}

module.exports = Atlan;
