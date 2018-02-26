const Util = require('./Util');

function validateMiddleware(middleware) {
  if (middleware == null || middleware.constructor !== Object) {
    return false;
  }
  if (
    !Util.checkPossibleKeys(middleware, [
      'getOne',
      'getMany',
      'post',
      'patch',
      'delete'
    ])
  ) {
    return false;
  }
  for (let method in middleware) {
    if (
      middleware[method] == null ||
      middleware[method].constructor !== Array
    ) {
      return false;
    }
    for (let middlewareFunction of middleware[method]) {
      if (
        middlewareFunction == null ||
        middlewareFunction.constructor !== Function
      ) {
        return false;
      }
    }
  }
  return true;
}

module.exports = { validateMiddleware };
