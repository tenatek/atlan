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
      res.sendStatus(500);
    }
  };
}

function filter(middleware) {
  return async function (req, res, next) {
    try {
      res.locals.data = await middleware(res.locals.data, res.locals.authorization);
      next();
    } catch (err) {
      res.sendStatus(500);
    }
  };
}

function query(middleware, model) {
  return async function (req, res, next) {
    let queryData = {
      id: req.params.id,
      params: req.query,
      data: req.body
    };
    try {
      res.locals.data = await middleware(model, queryData);
      next();
    } catch (err) {
      res.sendStatus(500);
    }
  };
}

function validate(middleware, model, schemas) {
  return async function (req, res, next) {
    try {
      if (await middleware(schemas, model, req.body)) {
        next();
      } else {
        res.sendStatus(400);
      }
    } catch (err) {
      res.sendStatus(500);
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
      res.sendStatus(500);
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
