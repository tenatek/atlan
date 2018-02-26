const express = require('express');

const SchemaValidator = require('./SchemaValidator');
const SchemaIndexer = require('./SchemaIndexer');
const HookValidator = require('./HookValidator');
const MiddlewareValidator = require('./MiddlewareValidator');
const Router = require('./Router');

class Atlan {
  constructor() {
    this.r = express.Router();
    this.d = null;
    this.schemas = {};
    this.hooks = {};
    this.middleware = {};
    this.refIndexes = {};
    this.fileIndexes = {};
  }

  driver(err, db) {
    if (err) {
      throw new Error('Error establishing a database connection.');
    } else {
      this.d = db;
    }
  }

  router() {
    return this.r;
  }

  async model(...args) {
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
      let { schema, hooks, middleware } = definition;

      // add schema to schema store

      if (
        !this.schemas[name] &&
        SchemaValidator.validateSchema(this.schemas, schema, pendingModels)
      ) {
        this.schemas[name] = schema;
        this.refIndexes[name] = SchemaIndexer.index(schema, 'ref', ['model']);
        this.fileIndexes[name] = SchemaIndexer.index(schema, 'file', []);
      } else {
        throw new Error('Invalid schema.');
      }

      // add hooks to hook store

      if (hooks) {
        if (HookValidator.validateHooks(hooks)) {
          this.hooks[name] = hooks;
        } else {
          throw new Error('Invalid hooks.');
        }
      } else {
        hooks = {};
      }

      if (middleware) {
        if (MiddlewareValidator.validateMiddleware(middleware)) {
          this.middleware[name] = middleware;
        } else {
          throw new Error('Invalid middleware.');
        }
      } else {
        middleware = {};
      }

      // add routes to router

      Router.route(
        this.r,
        this.d,
        name,
        hooks,
        middleware,
        this.refIndexes,
        this.schemas,
        this.fileIndexes
      );
    }
  }
}

module.exports = Atlan;
