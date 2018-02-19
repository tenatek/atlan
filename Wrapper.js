// TODO: send custom errors

function authorize(middleware) {
  return async function (req, res, next) {
    try {
      let authorizationResult = await middleware(req);
      if (authorizationResult === null) res.sendStatus(403);
      else if (typeof authorizationResult === 'string') {
        res.locals.authorization = authorizationResult;
        next();
      } else throw new Error('Invalid authorization middleware.');
    } catch (err) {
      res.status(500).send(err.message);
    }
  };
}

function filter(middleware) {
  return async function (req, res, next) {
    try {
      res.locals.data = await middleware(res.locals.data, res.locals.authorization);
      next();
    } catch (err) {
      res.status(500).send(err.message);
    }
  };
}

function query(middleware, model, db, schemas, indexes) {
  return async function (req, res, next) {
    let queryData = {
      id: req.params.id,
      params: req.query,
      data: req.body
    };
    try {
      res.locals.data = await middleware(db, model, queryData, indexes, schemas);
      next();
    } catch (err) {
      res.status(500).send(err.message);
    }
  };
}

function validate(middleware, model, schemas, db) {
  return async function (req, res, next) {
    try {
      if (await middleware(db, schemas, model, req.body)) {
        next();
      } else {
        res.sendStatus(400);
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  };
}

function check(middleware) {
  return async function (req, res, next) {
    try {
      let checkResult = await middleware(req.body, res.locals.authorization);
      if (checkResult === true) {
        next();
      } else if (checkResult === false) {
        res.sendStatus(400);
      } else {
        throw new Error('Invalid validation middleware.');
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  };
}

module.exports = {
  authorize,
  filter,
  query,
  validate,
  check
};
