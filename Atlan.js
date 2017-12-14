const DataValidator = require('./validation/DataValidator');
const SchemaValidator = require('./validation/SchemaValidator');
const HookValidator = require('./validation/HookValidator');
const Router = require('./connections/Router');
const Driver = require('./connections/Driver');

class Atlan {
  constructor() {
    this.r = new Router();
    this.schemas = {};
    this.hooks = {};
  }

  driver(err, db) {
    if (err) throw new Error('Error establishing a database connection.');
    else this.d = new Driver(db);
  }

  router() {
    return this.r.router;
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
      ) this.schemas[name] = schema;
      else throw new Error('Invalid schema.');

      // add hooks to hook store
      if (hooks) {
        if (HookValidator.validateHooks(hooks)) this.hooks[name] = hooks;
        else throw new Error('Invalid hooks.');
      }

      // define mandatory middleware
      // TODO: this goes, as the hooks will be directly in the router
      let middleware = {
        getOne: Object.assign({
          query: this.d.getOne.bind(this.d)
        }, this.hooks[name] ? this.hooks[name].getOne : null),
        getMany: Object.assign({
          query: this.d.getMany.bind(this.d)
        }, this.hooks[name] ? this.hooks[name].getMany : null),
        post: Object.assign({
          query: this.d.create.bind(this.d),
          dataValidation: DataValidator.validateCreateRequest.bind(this)
        }, this.hooks[name] ? this.hooks[name].post : null),
        patch: Object.assign({
          query: this.d.update.bind(this.d),
          dataValidation: DataValidator.validateUpdateRequest.bind(this)
        }, this.hooks[name] ? this.hooks[name].patch : null),
        delete: Object.assign({
          query: this.d.remove.bind(this.d)
        }, this.hooks[name] ? this.hooks[name].delete : null)
      };

      // add routes to router
      this.r.addRoutes(name, middleware, this.schemas);
    }
  }
}

module.exports = Atlan;
