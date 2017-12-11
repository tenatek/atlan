module.exports = {

  // optional, developer-defined middleware
  authorizationWrapper(middleware) {
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

};
