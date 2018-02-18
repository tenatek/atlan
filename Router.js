const Driver = require('./Driver');
const DataValidator = require('./DataValidator');
const Wrapper = require('./Wrapper');

/*
 * GET ONE
 * Authorize, query and filter
 * Returns data
 */

function routeGetOne(router, model, hooks) {
  let middleware = [];

  // developer-defined authorization middleware, if it exists
  if (hooks.authorization) {
    middleware.push(Wrapper.authorize(hooks.authorization));
  }

  // package-defined query middleware
  middleware.push(Wrapper.query(Driver.getOne, model));

  // developer-defined filter middleware, if it exists
  if (hooks.filter) {
    middleware.push(Wrapper.filter(hooks.filter));
  }

  router.get(`/${model}/:id`, ...middleware, (req, res) => {
    res.status(200).send(res.locals.data);
  });
}

/*
 * GET MANY
 * Authorize, query and filter
 * Returns data
 */

function routeGetMany(router, model, hooks) {
  let middleware = [];

  // developer-defined authorization middleware, if it exists
  if (hooks.authorization) {
    middleware.push(Wrapper.authorize(hooks.authorization));
  }

  // package-defined query middleware
  middleware.push(Wrapper.query(Driver.getMany, model));

  // developer-defined filter middleware, if it exists
  if (hooks.filter) middleware.push(Wrapper.filter(hooks.filter));

  router.get(`/${model}`, ...middleware, (req, res) => {
    res.status(200).send(res.locals.data);
  });
}

/*
 * POST
 * Authorize, validate, check and query
 * Returns ID
 */

function routePost(router, model, hooks, schemas) {
  let middleware = [];

  // developer-defined authorization middleware, if it exists
  if (hooks.authorization) {
    middleware.push(Wrapper.authorize(hooks.authorization));
  }

  // package-defined schema validation middleware
  middleware.push(Wrapper.validate(DataValidator.validateCreateRequest, model, schemas));

  // developer-defined custom validation middleware, if it exists
  if (hooks.check) {
    middleware.push(Wrapper.check(hooks.check));
  }

  // package-defined query middleware
  middleware.push(Wrapper.query(Driver.create, model));

  router.post(`/${model}`, ...middleware, (req, res) => {
    res.status(201).send(res.locals.data);
  });
}

/*
 * PATCH
 * Authorize, validate, check and query
 * No return value
 */

function routePatch(router, model, hooks, schemas) {
  let middleware = [];

  // developer-defined authorization middleware, if it exists
  if (hooks.authorization) {
    middleware.push(Wrapper.authorize(hooks.authorization));
  }

  // package-defined schema validation middleware
  middleware.push(Wrapper.validate(DataValidator.validateUpdateRequest, model, schemas));

  // developer-defined custom validation middleware, if it exists
  if (hooks.check) {
    middleware.push(Wrapper.check(hooks.check));
  }

  // package-defined query middleware
  middleware.push(Wrapper.query(Driver.update, model));

  router.patch(`/${model}/:id`, ...middleware, (req, res) => {
    res.sendStatus(200);
  });
}

/*
 * DELETE
 * Authorize and query
 * No return value
 */

function routeDelete(router, model, hooks) {
  let middleware = [];

  // developer-defined authorization middleware, if it exists
  if (hooks.authorization) {
    middleware.push(Wrapper.authorize(hooks.authorization));
  }

  // package-defined query middleware
  middleware.push(Wrapper.query(Driver.remove, model));

  router.delete(`/${model}/:id`, ...middleware, (req, res) => {
    res.sendStatus(200);
  });
}

function route(router, model, hooks, schemas) {
  routeGetOne(router, model, hooks);
  routeGetMany(model, model, hooks);
  routePost(model, model, hooks, schemas);
  routePatch(model, model, hooks, schemas);
  routeDelete(model, model, hooks);
}

module.exports = { route };
