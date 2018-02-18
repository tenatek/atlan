const Driver = require('./Driver');
const DataValidator = require('./DataValidator');
const Wrapper = require('./Wrapper');

/*
 * GET ONE
 * Authorize, query and filter
 * Returns data
 */

function routeGetOne(router, db, model, hooks, indexes) {
  let middleware = [];

  // developer-defined authorization middleware, if it exists
  if (hooks && hooks.authorize) {
    middleware.push(Wrapper.authorize(hooks.authorize));
  }

  // package-defined query middleware
  middleware.push(Wrapper.query(Driver.getOne, model, db, indexes));

  // developer-defined filter middleware, if it exists
  if (hooks && hooks.filter) {
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

function routeGetMany(router, db, model, hooks, indexes) {
  let middleware = [];

  // developer-defined authorization middleware, if it exists
  if (hooks && hooks.authorize) {
    middleware.push(Wrapper.authorize(hooks.authorize));
  }

  // package-defined query middleware
  middleware.push(Wrapper.query(Driver.getMany, model, db, indexes));

  // developer-defined filter middleware, if it exists
  if (hooks && hooks.filter) middleware.push(Wrapper.filter(hooks.filter));

  router.get(`/${model}`, ...middleware, (req, res) => {
    res.status(200).send(res.locals.data);
  });
}

/*
 * POST
 * Authorize, validate, check and query
 * Returns ID
 */

function routePost(router, db, model, hooks, schemas, indexes) {
  let middleware = [];

  // developer-defined authorization middleware, if it exists
  if (hooks && hooks.authorize) {
    middleware.push(Wrapper.authorize(hooks.authorize));
  }

  // package-defined schema validation middleware
  middleware.push(Wrapper.validate(DataValidator.validateCreateRequest, model, schemas, db));

  // developer-defined custom validation middleware, if it exists
  if (hooks && hooks.check) {
    middleware.push(Wrapper.check(hooks.check));
  }

  // package-defined query middleware
  middleware.push(Wrapper.query(Driver.create, model, db, indexes));

  router.post(`/${model}`, ...middleware, (req, res) => {
    res.status(201).send(res.locals.data);
  });
}

/*
 * PATCH
 * Authorize, validate, check and query
 * No return value
 */

function routePatch(router, db, model, hooks, schemas, indexes) {
  let middleware = [];

  // developer-defined authorization middleware, if it exists
  if (hooks && hooks.authorize) {
    middleware.push(Wrapper.authorize(hooks.authorize));
  }

  // package-defined schema validation middleware
  middleware.push(Wrapper.validate(DataValidator.validateUpdateRequest, model, schemas, db));

  // developer-defined custom validation middleware, if it exists
  if (hooks && hooks.check) {
    middleware.push(Wrapper.check(hooks.check));
  }

  // package-defined query middleware
  middleware.push(Wrapper.query(Driver.update, model, db, indexes));

  router.patch(`/${model}/:id`, ...middleware, (req, res) => {
    res.sendStatus(200);
  });
}

/*
 * DELETE
 * Authorize and query
 * No return value
 */

function routeDelete(router, db, model, hooks) {
  let middleware = [];

  // developer-defined authorization middleware, if it exists
  if (hooks && hooks.authorize) {
    middleware.push(Wrapper.authorize(hooks.authorize));
  }

  // package-defined query middleware
  middleware.push(Wrapper.query(Driver.remove, model, db));

  router.delete(`/${model}/:id`, ...middleware, (req, res) => {
    res.sendStatus(200);
  });
}

function route(router, db, model, hooks, schemas, indexes) {
  routeGetOne(router, db, model, hooks.getOne, indexes);
  routeGetMany(router, db, model, hooks.getMany, indexes);
  routePost(router, db, model, hooks.post, schemas, indexes);
  routePatch(router, db, model, hooks.patch, schemas, indexes);
  routeDelete(router, db, model, hooks.delete);
}

module.exports = { route };
