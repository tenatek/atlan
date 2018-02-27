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
      res.locals.data = await middleware(
        db,
        model,
        queryData,
        refIndexes,
        schemas
      );
      next();
    } catch (err) {
      res.status(500).send(err.message);
    }
  };
}

function validate(middleware, model, db, refIndexes, schemas) {
  return async function (req, res, next) {
    try {
      if (await middleware(db, refIndexes, schemas, model, req.body)) {
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
  parse,
  query,
  validate
};
