const QueryBuilder = require('./QueryBuilder');

class Router {

  static createGetOneRoute(model, modelName, driver, router) {
    router.get(
      `/${modelName}/:id`,
      ...model.hooks.getOne.willQuery,
      async (req, res, next) => {
        try {
          res.data = await driver.getDocs(
            modelName,
            QueryBuilder.wrapId(req.params.id),
            [],
            QueryBuilder.getModelsToPopulate(req.query)
          );
          next();
        } catch (err) {
          res.status(500).send(err.message);
        }
      },
      ...model.hooks.getOne.didQuery,
      (req, res) => {
        res.status(200).send(res.data);
      }
    );
  }

  static createGetManyRoute(model, modelName, driver, router) {
    router.get(
      `/${modelName}`,
      ...model.hooks.getMany.willQuery,
      async (req, res, next) => {
        try {
          res.data = await driver.getDocs(
            modelName,
            QueryBuilder.buildQuery(req.query),
            [],
            QueryBuilder.getModelsToPopulate(req.query)
          );
          next();
        } catch (err) {
          res.status(500).send(err.message);
        }
      },
      ...model.hooks.getMany.didQuery,
      (req, res) => {
        res.status(200).send(res.data);
      }
    );
  }

  static createPostRoute(model, modelName, dataValidator, driver, router) {
    router.post(
      `/${modelName}`,
      ...model.hooks.post.willValidate,
      async (req, res, next) => {
        let validationResult = await dataValidator.validateInsert(
          modelName,
          req.body
        );
        if (validationResult.success) {
          next();
        } else {
          res.status(400).send(validationResult.getErrorPathsAsPointers());
        }
      },
      ...model.hooks.post.didValidateWillWrite,
      async (req, res, next) => {
        try {
          await driver.insertDoc(modelName, req.body);
          next();
        } catch (err) {
          res.status(500).send(err.message);
        }
      },
      ...model.hooks.post.didWrite,
      (req, res) => {
        res.sendStatus(201);
      }
    );
  }

  static createPatchRoute(model, modelName, dataValidator, driver, router) {
    router.patch(
      `/${modelName}/:id`,
      ...model.hooks.patch.willValidate,
      async (req, res, next) => {
        let validationResult = await dataValidator.validateUpdate(
          modelName,
          req.body
        );
        if (validationResult.success) {
          next();
        } else {
          res.status(400).send(validationResult.getErrorPathsAsPointers());
        }
      },
      ...model.hooks.patch.didValidateWillWrite,
      async (req, res, next) => {
        try {
          await driver.updateDoc(modelName, req.params.id, req.body);
          next();
        } catch (err) {
          res.status(500).send(err.message);
        }
      },
      ...model.hooks.patch.didWrite,
      (req, res) => {
        res.sendStatus(200);
      }
    );
  }

  static createDeleteRoute(model, modelName, driver, router) {
    router.delete(
      `/${modelName}/:id`,
      ...model.hooks.delete.willDelete,
      async (req, res, next) => {
        try {
          await driver.deleteDoc(modelName, req.params.id);
          next();
        } catch (err) {
          res.status(500).send(err.message);
        }
      },
      ...model.hooks.delete.didDelete,
      (req, res) => {
        res.sendStatus(200);
      }
    );
  }

  static createRoutes(model, modelName, dataValidator, driver, router) {
    Router.createGetOneRoute(model, modelName, driver, router);
    Router.createGetManyRoute(model, modelName, driver, router);
    Router.createPostRoute(model, modelName, dataValidator, driver, router);
    Router.createPatchRoute(model, modelName, dataValidator, driver, router);
    Router.createDeleteRoute(model, modelName, driver, router);
  }

}

module.exports = Router;
