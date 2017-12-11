module.exports = {

  // optional, developer-defined middleware
  filterWrapper(middleware) {
    return async function (req, res, next) {
      try {
        res.locals.data = await middleware(res.locals.data, res.locals.authorization);
        next();
      } catch (err) {
        res.sendStatus(500);
      }
    };
  }

};
