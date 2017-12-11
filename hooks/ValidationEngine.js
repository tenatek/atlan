module.exports = {

  // mandatory, package-defined middleware
  dataValidationWrapper(middleware, model, schemas) {
    return async function (req, res, next) {
      try {
        if (await middleware(schemas, model, req.body)) next();
        else res.sendStatus(400); // TODO send custom errors
      } catch (err) {
        res.sendStatus(500);
      }
    };
  },

  // optional, developer-defined middleware
  validationWrapper(middleware) {
    return async function (req, res, next) {
      try {
        let validationResult = await middleware(req.body, res.locals.authorization);
        if (validationResult === true) next();
        else if (validationResult === false) res.sendStatus(400); // TODO send custom errors
        else throw new Error('Invalid validation middleware.');
      } catch (err) {
        res.sendStatus(500);
      }
    };

  }
};
