function auth(middleware) {
  return async function (req, res, next) {
    try {
      let authorizationResult = await middleware(req);
      if (authorizationResult === null) {
        res.sendStatus(403);
      } else if (typeof authorizationResult === 'string') {
        res.locals.authorization = authorizationResult;
        next();
      } else {
        throw new Error('Invalid authorization middleware.');
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  };
}

function before(middleware) {
  return async function (req, res, next) {
    try {
      let checkResult = await middleware(res.locals.authorization, req);
      if (checkResult === true) {
        next();
      } else if (checkResult === false) {
        res.sendStatus(400);
      } else {
        throw new Error('Invalid pre-processing middleware.');
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  };
}

function after(middleware) {
  return async function (req, res, next) {
    try {
      res.locals.data = await middleware(res.locals.authorization, res.locals.data);
      next();
    } catch (err) {
      res.status(500).send(err.message);
    }
  };
}

function parse() {
  return function (req, res, next) {
    try {
      req.body = JSON.parse(req.body.data);
      next();
    } catch (err) {
      res.status(500).send(err.message);
    }
  };
}

function query(middleware, model, db, refIndexes, schemas) {
  return async function (req, res, next) {
    let queryData = {
      id: req.params.id,
      params: req.query,
      data: req.body
    };
    try {
      res.locals.data = await middleware(db, model, queryData, refIndexes, schemas);
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

module.exports = {
  auth,
  before,
  after,
  parse,
  query,
  validate
};
