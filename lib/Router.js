const QueryBuilder = require('./QueryBuilder');

class Router {

  static createGetOneRoute(modelName, middlewareHandler, driver, router) {
    router.get(
      `/${modelName}/:id`,
      middlewareHandler.getHooks(modelName, 'getOne', 'willQuery'),
      async (req, res, next) => {
        try {
          [res.data] = await driver.getDocs(
            modelName,
            QueryBuilder.wrapId(req.params.id),
            QueryBuilder.getModelsToPopulate(req.query),
            []
          );
          next();
        } catch (err) {
          next(err);
        }
      },
      middlewareHandler.getHooks(modelName, 'getOne', 'didQuery'),
      (req, res) => {
        res.status(200).send(res.data);
      }
    );
  }

  static createGetManyRoute(
    modelName,
    middlewareHandler,
    queryBuilder,
    driver,
    router
  ) {
    router.get(
      `/${modelName}`,
      middlewareHandler.getHooks(modelName, 'getMany', 'willQuery'),
      async (req, res, next) => {
        try {
          res.data = await driver.getDocs(
            modelName,
            queryBuilder.buildQuery(modelName, req.query),
            QueryBuilder.getModelsToPopulate(req.query),
            [],
            QueryBuilder.buildSortQuery(req.query)
          );
          next();
        } catch (err) {
          next(err);
        }
      },
      middlewareHandler.getHooks(modelName, 'getMany', 'didQuery'),
      (req, res) => {
        res.status(200).send(res.data);
      }
    );
  }

  static createPostRoute(
    modelName,
    dataValidator,
    middlewareHandler,
    driver,
    router
  ) {
    router.post(
      `/${modelName}`,
      middlewareHandler.getHooks(modelName, 'post', 'willValidate'),
      async (req, res, next) => {
        try {
          await dataValidator.validateInsert(modelName, req.body);
          next();
        } catch (err) {
          next(err);
        }
      },
      middlewareHandler.getHooks(modelName, 'post', 'didValidateWillWrite'),
      async (req, res, next) => {
        try {
          res.data = await driver.insertDoc(modelName, req.body);
          next();
        } catch (err) {
          next(err);
        }
      },
      middlewareHandler.getHooks(modelName, 'post', 'didWrite'),
      (req, res) => {
        res.status(201).send(res.data);
      }
    );
  }

  static createPatchRoute(
    modelName,
    dataValidator,
    middlewareHandler,
    driver,
    router
  ) {
    let willValidateMiddleware = middlewareHandler.getHooks(
      modelName,
      'patch',
      'willValidate'
    );
    let willQueryMiddleware = middlewareHandler.getHooks(
      modelName,
      'patch',
      'willQuery'
    );
    let didQueryWillValidateMiddleware = middlewareHandler.getHooks(
      modelName,
      'patch',
      'didQueryWillValidate'
    );
    if (
      willQueryMiddleware.length !== 0 ||
      didQueryWillValidateMiddleware.length !== 0
    ) {
      willValidateMiddleware = [
        willQueryMiddleware,
        async (req, res, next) => {
          try {
            [res.data] = await driver.getDocs(
              modelName,
              QueryBuilder.wrapId(req.params.id),
              [],
              []
            );
            next();
          } catch (err) {
            next(err);
          }
        },
        didQueryWillValidateMiddleware
      ];
    }
    router.patch(
      `/${modelName}/:id`,
      willValidateMiddleware,
      async (req, res, next) => {
        try {
          await dataValidator.validateUpdate(modelName, req.body);
          next();
        } catch (err) {
          next(err);
        }
      },
      middlewareHandler.getHooks(modelName, 'patch', 'didValidateWillWrite'),
      async (req, res, next) => {
        try {
          await driver.updateDoc(modelName, req.params.id, req.body);
          next();
        } catch (err) {
          next(err);
        }
      },
      middlewareHandler.getHooks(modelName, 'patch', 'didWrite'),
      (req, res) => {
        res.sendStatus(200);
      }
    );
  }

  static createDeleteRoute(modelName, middlewareHandler, driver, router) {
    let willDeleteMiddleware = middlewareHandler.getHooks(
      modelName,
      'delete',
      'willDelete'
    );
    let willQueryMiddleware = middlewareHandler.getHooks(
      modelName,
      'delete',
      'willQuery'
    );
    let didQueryWillDeleteMiddleware = middlewareHandler.getHooks(
      modelName,
      'delete',
      'didQueryWillDelete'
    );
    if (
      willQueryMiddleware.length !== 0 ||
      didQueryWillDeleteMiddleware.length !== 0
    ) {
      willDeleteMiddleware = [
        willQueryMiddleware,
        async (req, res, next) => {
          try {
            [res.data] = await driver.getDocs(
              modelName,
              QueryBuilder.wrapId(req.params.id),
              [],
              []
            );
            next();
          } catch (err) {
            next(err);
          }
        },
        didQueryWillDeleteMiddleware
      ];
    }
    router.delete(
      `/${modelName}/:id`,
      willDeleteMiddleware,
      async (req, res, next) => {
        try {
          await driver.deleteDoc(modelName, req.params.id);
          next();
        } catch (err) {
          next(err);
        }
      },
      middlewareHandler.getHooks(modelName, 'delete', 'didDelete'),
      (req, res) => {
        res.sendStatus(200);
      }
    );
  }

  static setErrorHandler(modelName, middlewareHandler, router) {
    router.use(
      [`/${modelName}`, `/${modelName}/**`],
      middlewareHandler.getErrorHandler(modelName)
    );
  }

  static createRoutes(
    modelName,
    dataValidator,
    middlewareHandler,
    queryBuilder,
    driver,
    router
  ) {
    Router.createGetOneRoute(modelName, middlewareHandler, driver, router);
    Router.createGetManyRoute(
      modelName,
      middlewareHandler,
      queryBuilder,
      driver,
      router
    );
    Router.createPostRoute(
      modelName,
      dataValidator,
      middlewareHandler,
      driver,
      router
    );
    Router.createPatchRoute(
      modelName,
      dataValidator,
      middlewareHandler,
      driver,
      router
    );
    Router.createDeleteRoute(modelName, middlewareHandler, driver, router);
    Router.setErrorHandler(modelName, middlewareHandler, router);
  }

}

module.exports = Router;
