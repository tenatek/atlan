class MiddlewareHandler {

  constructor(defaultHooks, defaultErrorHandler) {
    this.hooks = {};
    this.defaultHooks = defaultHooks;
    this.errorHandlers = {};
    this.defaultErrorHandler = defaultErrorHandler;
  }

  addHooks(modelName, hooks) {
    this.hooks[modelName] = hooks;
  }

  addErrorHandler(modelName, errorHandler) {
    this.errorHandlers[modelName] = errorHandler;
  }

  getHooks(modelName, route, hookType) {
    if (this.hooks[modelName][route][hookType].length !== 0) {
      return this.hooks[modelName][route][hookType];
    }
    return this.defaultHooks[route][hookType];
  }

  getErrorHandler(modelName) {
    if (this.errorHandlers[modelName]) {
      return this.errorHandlers[modelName];
    }
    if (this.defaultErrorHandler) {
      return this.defaultErrorHandler;
    }
    return MiddlewareHandler.handleError;
  }

  // eslint-disable-next-line no-unused-vars
  static handleError(err, req, res, next) {
    if (err.message === 'validation') {
      res.status(400).send(err.errorPaths);
    } else {
      res.sendStatus(500);
    }
  }

}

module.exports = MiddlewareHandler;
