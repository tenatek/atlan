const bodyParser = require('body-parser');
const multer = require('multer');

const Driver = require('./Driver');
const DataValidator = require('./DataValidator');
const Wrapper = require('./Wrapper');

/*
 * GET ONE
 * runs authorization, query and post-processing hooks
 * returns data
 */

function routeGetOne(router, db, model, hooks, refIndexes) {
  let middleware = [];

  // developer-defined authorization middleware, if it exists
  if (hooks && hooks.auth) {
    middleware.push(Wrapper.auth(hooks.auth));
  }

  // package-defined query middleware
  middleware.push(Wrapper.query(Driver.getOne, model, db, refIndexes));

  // developer-defined post-processing middleware, if it exists
  if (hooks && hooks.after) {
    middleware.push(Wrapper.after(hooks.after));
  }

  router.get(`/${model}/:id`, ...middleware, (req, res) => {
    res.status(200).send(res.locals.data);
  });
}

/*
 * GET MANY
 * runs authorization, query and post-processing hooks
 * returns data
 */

function routeGetMany(router, db, model, hooks, refIndexes, schemas) {
  let middleware = [];

  // developer-defined authorization middleware, if it exists
  if (hooks && hooks.auth) {
    middleware.push(Wrapper.auth(hooks.auth));
  }

  // package-defined query middleware
  middleware.push(Wrapper.query(Driver.getMany, model, db, refIndexes, schemas));

  // developer-defined post-processing middleware, if it exists
  if (hooks && hooks.after) {
    middleware.push(Wrapper.after(hooks.after));
  }

  router.get(`/${model}`, ...middleware, (req, res) => {
    res.status(200).send(res.locals.data);
  });
}

/*
 * POST
 * runs authorization, pre-processing, validate and query hooks
 * returns ID
 */

function routePost(router, db, model, hooks, refIndexes, schemas, fileIndexes) {
  let middleware = [];

  if (fileIndexes[model].length !== 0) {
    let files = fileIndexes[model].map((element) => {
      return {
        name: element.path[element.path.length - 1],
        maxCount: 1
      };
    });
    middleware.push(multer().fields(files));
    middleware.push(Wrapper.parse());
  } else {
    middleware.push(bodyParser.json());
  }

  // developer-defined authorization middleware, if it exists
  if (hooks && hooks.auth) {
    middleware.push(Wrapper.auth(hooks.auth));
  }

  // developer-defined custom validation middleware, if it exists
  if (hooks && hooks.before) {
    middleware.push(Wrapper.before(hooks.before));
  }

  // package-defined schema validation middleware
  middleware.push(Wrapper.validate(DataValidator.validateCreateRequest, model, schemas, db));

  // package-defined query middleware
  middleware.push(Wrapper.query(Driver.create, model, db, refIndexes));

  router.post(`/${model}`, ...middleware, (req, res) => {
    res.status(201).send(res.locals.data);
  });
}

/*
 * PATCH
 * runs authorization, pre-processing, validate and query hooks
 * no return value
 */

function routePatch(router, db, model, hooks, refIndexes, schemas, fileIndexes) {
  let middleware = [];

  if (fileIndexes[model].length !== 0) {
    let files = fileIndexes[model].map((element) => {
      return {
        name: element.path[element.path.length - 1],
        maxCount: 1
      };
    });
    middleware.push(multer().fields(files));
    middleware.push(Wrapper.parse());
  } else {
    middleware.push(bodyParser.json());
  }

  // developer-defined authorization middleware, if it exists
  if (hooks && hooks.auth) {
    middleware.push(Wrapper.auth(hooks.auth));
  }

  // developer-defined custom validation middleware, if it exists
  if (hooks && hooks.before) {
    middleware.push(Wrapper.before(hooks.before));
  }

  // package-defined schema validation middleware
  middleware.push(Wrapper.validate(DataValidator.validateUpdateRequest, model, schemas, db));

  // package-defined query middleware
  middleware.push(Wrapper.query(Driver.update, model, db, refIndexes));

  router.patch(`/${model}/:id`, ...middleware, (req, res) => {
    res.sendStatus(200);
  });
}

/*
 * DELETE
 * runs authorization and query hooks
 * no return value
 */

function routeDelete(router, db, model, hooks) {
  let middleware = [];

  // developer-defined authorization middleware, if it exists
  if (hooks && hooks.auth) {
    middleware.push(Wrapper.auth(hooks.auth));
  }

  // package-defined query middleware
  middleware.push(Wrapper.query(Driver.remove, model, db));

  router.delete(`/${model}/:id`, ...middleware, (req, res) => {
    res.sendStatus(200);
  });
}

function route(router, db, model, hooks, refIndexes, schemas, fileIndexes) {
  routeGetOne(router, db, model, hooks.getOne, refIndexes);
  routeGetMany(router, db, model, hooks.getMany, refIndexes, schemas);
  routePost(router, db, model, hooks.post, refIndexes, schemas, fileIndexes);
  routePatch(router, db, model, hooks.patch, refIndexes, schemas, fileIndexes);
  routeDelete(router, db, model, hooks.delete);
}

module.exports = { route };
