const bodyParser = require('body-parser');
const multer = require('multer');

const Driver = require('./lib/Driver');
const DataValidator = require('./DataValidator');
const MiddlewareWrapper = require('./MiddlewareWrapper');

/*
 * GET ONE
 * runs authorization, query and post-processing hooks
 * returns data
 */

function routeGetOne(
  router,
  db,
  model,
  hooks,
  middleware,
  refIndexes,
  schemas
) {
  let middlewareArray = [];

  if (middleware) {
    middlewareArray = middleware;
  }

  // developer-defined pre-processing middleware, if it exists
  if (hooks && hooks.before) {
    middlewareArray = middlewareArray.concat(hooks.before);
  }

  // package-defined query middleware
  middlewareArray.push(
    MiddlewareWrapper.query(Driver.getOne, model, db, refIndexes, schemas)
  );

  // developer-defined post-processing middleware, if it exists
  if (hooks && hooks.after) {
    middlewareArray = middlewareArray.concat(hooks.after);
  }

  router.get(`/${model}/:id`, ...middlewareArray, (req, res) => {
    res.status(200).send(res.locals.data);
  });
}

/*
 * GET MANY
 * runs authorization, query and post-processing hooks
 * returns data
 */

function routeGetMany(
  router,
  db,
  model,
  hooks,
  middleware,
  refIndexes,
  schemas
) {
  let middlewareArray = [];

  if (middleware) {
    middlewareArray = middleware;
  }

  // developer-defined pre-processing middleware, if it exists
  if (hooks && hooks.before) {
    middlewareArray = middlewareArray.concat(hooks.before);
  }

  // package-defined query middleware
  middlewareArray.push(
    MiddlewareWrapper.query(Driver.getMany, model, db, refIndexes, schemas)
  );

  // developer-defined post-processing middleware, if it exists
  if (hooks && hooks.after) {
    middlewareArray = middlewareArray.concat(hooks.after);
  }

  router.get(`/${model}`, ...middlewareArray, (req, res) => {
    res.status(200).send(res.locals.data);
  });
}

/*
 * POST
 * runs authorization, pre-processing, validate and query hooks
 * returns ID
 */

function routePost(
  router,
  db,
  model,
  hooks,
  middleware,
  refIndexes,
  schemas,
  fileIndexes
) {
  let middlewareArray = [];

  if (middleware) {
    middlewareArray = middleware;
  }

  if (fileIndexes[model].length !== 0) {
    let files = fileIndexes[model].map(element => {
      return {
        name: element.path[element.path.length - 1]
      };
    });
    middlewareArray.push(multer().fields(files));
    middlewareArray.push(MiddlewareWrapper.parse());
  } else {
    middlewareArray.push(bodyParser.json());
  }

  // developer-defined pre-processing middleware, if it exists
  if (hooks && hooks.before) {
    middlewareArray = middlewareArray.concat(hooks.before);
  }

  // package-defined schema validation middleware
  middlewareArray.push(
    MiddlewareWrapper.validate(
      DataValidator.validateCreateRequest,
      model,
      db,
      refIndexes,
      schemas
    )
  );

  // package-defined query middleware
  middlewareArray.push(
    MiddlewareWrapper.query(Driver.create, model, db, refIndexes)
  );

  // developer-defined post-processing middleware, if it exists
  if (hooks && hooks.after) {
    middlewareArray = middlewareArray.concat(hooks.after);
  }

  router.post(`/${model}`, ...middlewareArray, (req, res) => {
    res.status(201).send(res.locals.data);
  });
}

/*
 * PATCH
 * runs authorization, pre-processing, validate and query hooks
 * no return value
 */

function routePatch(
  router,
  db,
  model,
  hooks,
  middleware,
  refIndexes,
  schemas,
  fileIndexes
) {
  let middlewareArray = [];

  if (middleware) {
    middlewareArray = middleware;
  }

  if (fileIndexes[model].length !== 0) {
    let files = fileIndexes[model].map(element => {
      return {
        name: element.path[element.path.length - 1]
      };
    });
    middlewareArray.push(multer().fields(files));
    middlewareArray.push(MiddlewareWrapper.parse());
  } else {
    middlewareArray.push(bodyParser.json());
  }

  // developer-defined pre-processing middleware, if it exists
  if (hooks && hooks.before) {
    middlewareArray = middlewareArray.concat(hooks.before);
  }

  // package-defined schema validation middleware
  middlewareArray.push(
    MiddlewareWrapper.validate(
      DataValidator.validateUpdateRequest,
      model,
      db,
      refIndexes,
      schemas
    )
  );

  // package-defined query middleware
  middlewareArray.push(
    MiddlewareWrapper.query(Driver.update, model, db, refIndexes)
  );

  // developer-defined post-processing middleware, if it exists
  if (hooks && hooks.after) {
    middlewareArray = middlewareArray.concat(hooks.after);
  }

  router.patch(`/${model}/:id`, ...middlewareArray, (req, res) => {
    res.sendStatus(200);
  });
}

/*
 * DELETE
 * runs authorization and query hooks
 * no return value
 */

function routeDelete(router, db, model, hooks, middleware) {
  let middlewareArray = [];

  if (middleware) {
    middlewareArray = middleware;
  }

  // developer-defined pre-processing middleware, if it exists
  if (hooks && hooks.before) {
    middlewareArray = middlewareArray.concat(hooks.before);
  }

  // package-defined query middleware
  middlewareArray.push(MiddlewareWrapper.query(Driver.remove, model, db));

  // developer-defined post-processing middleware, if it exists
  if (hooks && hooks.after) {
    middlewareArray = middlewareArray.concat(hooks.after);
  }

  router.delete(`/${model}/:id`, ...middlewareArray, (req, res) => {
    res.sendStatus(200);
  });
}

function route(
  router,
  db,
  model,
  hooks,
  middleware,
  refIndexes,
  schemas,
  fileIndexes
) {
  routeGetOne(
    router,
    db,
    model,
    hooks.getOne,
    middleware.getOne,
    refIndexes,
    schemas
  );
  routeGetMany(
    router,
    db,
    model,
    hooks.getMany,
    middleware.getMany,
    refIndexes,
    schemas
  );
  routePost(
    router,
    db,
    model,
    hooks.post,
    middleware.post,
    refIndexes,
    schemas,
    fileIndexes
  );
  routePatch(
    router,
    db,
    model,
    hooks.patch,
    middleware.patch,
    refIndexes,
    schemas,
    fileIndexes
  );
  routeDelete(router, db, model, hooks.delete, middleware.delete);
}

module.exports = { route };
