const QueryBuilder = require('./QueryBuilder');
const Util = require('./Util');

class Router {

  static createGetOneRoute(modelName, middlewareHandler, driver, router) {
    router.get(
      `/${modelName}/:id`,
      middlewareHandler.getHooks(modelName, 'getOne', 'willQuery'),
      async (req, res, next) => {
        try {
          [res.data] = await driver.getDocs(
            modelName,
            Util.wrapId(req.params.id),
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
    router.patch(
      `/${modelName}/:id`,
      middlewareHandler.getHooks(modelName, 'patch', 'willValidate'),
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
    router.delete(
      `/${modelName}/:id`,
      middlewareHandler.getHooks(modelName, 'delete', 'willDelete'),
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
