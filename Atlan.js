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
    else {
      this.d = new Driver(db);
    }
  }

  router() {
    return this.r.router;
  }

  model(model, schema, hooks) {
    // add schema to schema store
    if (
      !this.schemas[model] &&
      SchemaValidator.validateSchema(this.schemas, schema)
    ) this.schemas[model] = schema;
    else throw new Error('Invalid schema.');

    // add hooks to hook store
    if (hooks && HookValidator.validateHooks(hooks)) this.hooks[model] = hooks;
    else throw new Error('Invalid hooks.');

    // define mandatory middleware
    let middleware = {
      getOne: Object.assign({
        query: this.d.getOne.bind(this.d)
      }, this.hooks[model] ? this.hooks[model].getOne : null),
      getMany: Object.assign({
        query: this.d.getMany.bind(this.d)
      }, this.hooks[model] ? this.hooks[model].getMany : null),
      post: Object.assign({
        query: this.d.create.bind(this.d),
        dataValidation: DataValidator.validateCreateRequest.bind(this)
      }, this.hooks[model] ? this.hooks[model].post : null),
      patch: Object.assign({
        query: this.d.update.bind(this.d),
        dataValidation: DataValidator.validateUpdateRequest.bind(this)
      }, this.hooks[model] ? this.hooks[model].patch : null),
      delete: Object.assign({
        query: this.d.remove.bind(this.d)
      }, this.hooks[model] ? this.hooks[model].delete : null)
    };

    // add routes to router
    this.r.addRoutes(model, middleware, this.schemas);
  }
}

module.exports = Atlan;
