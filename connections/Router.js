function routeGetOne(router, model, hooks) {
  let middleware = [];

  // developer-defined authorization middleware, if it exists
  if (hooks.authorization) {
    middleware.push(Wrapper.authorize(hooks.authorization));
  }

  // package-defined query middleware
  middleware.push(Wrapper.query(hooks.query, model, false));

  // developer-defined filter middleware, if it exists
  if (hooks.filter) {
    middleware.push(Wrapper.filter(hooks.filter));
  }

  router.get(`/${model}/:id`, ...middleware, (req, res) => {
    res.status(200).send(res.locals.data);
  });
}

function routeGetMany(router, model, hooks) {
  let middleware = [];

  // developer-defined authorization middleware, if it exists
  if (hooks.authorization) {
    middleware.push(Wrapper.authorize(hooks.authorization));
  }

  // package-defined query middleware
  middleware.push(Wrapper.query(hooks.query, model, false));

  // developer-defined filter middleware, if it exists
  if (hooks.filter) middleware.push(Wrapper.filter(hooks.filter));

  router.get(`/${model}`, ...middleware, (req, res) => {
    res.status(200).send(res.locals.data);
  });
}

function routePost(router, model, hooks, schemas) {
  let middleware = [];

  // developer-defined authorization middleware, if it exists
  if (hooks.authorization) {
    middleware.push(Wrapper.authorize(hooks.authorization));
  }

  // package-defined schema validation middleware
  middleware.push(Wrapper.validate(hooks.dataValidation, model, schemas));

  // developer-defined custom validation middleware, if it exists
  if (hooks.validation) {
    middleware.push(Wrapper.check(hooks.validation));
  }

  // package-defined query middleware
  middleware.push(Wrapper.query(hooks.query, model, true));

  router.post(`/${model}`, ...middleware, (req, res) => {
    res.sendStatus(201);
  });
}

function routePatch(router, model, hooks, schemas) {
  let middleware = [];

  // developer-defined authorization middleware, if it exists
  if (hooks.authorization) {
    middleware.push(Wrapper.authorize(hooks.authorization));
  }

  // package-defined schema validation middleware
  middleware.push(Wrapper.validate(hooks.dataValidation, model, schemas));

  // developer-defined custom validation middleware, if it exists
  if (hooks.validation) {
    middleware.push(Wrapper.check(hooks.validation));
  }

  // package-defined query middleware
  middleware.push(Wrapper.query(hooks.query, model, true));

  router.patch(`/${model}/:id`, ...middleware, (req, res) => {
    res.sendStatus(200);
  });
}

function routeDelete(router, model, hooks) {
  let middleware = [];

  // developer-defined authorization middleware, if it exists
  if (hooks.authorization) {
    middleware.push(Wrapper.authorize(hooks.authorization));
  }

  // package-defined query middleware
  middleware.push(Wrapper.query(hooks.query, model, false));

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
