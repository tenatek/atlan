module.exports = {

  // mandatory, package-defined middleware
  queryWrapper(middleware, model, data) {
    return async function (req, res, next) {
      try {
        let params;
        if (req.query) params = req.query;
        if (req.query._search) {
          delete params._search;
          params.$text = {
            $search: params._search
          };
        }
        if (req.params.id) params = req.params.id;
        let args = [params];
        if (data) args.unshift(req.body);
        res.locals.data = await middleware(model, ...args);
        next();
      } catch (err) {
        res.sendStatus(500);
      }
    };
  }

};
