class Router {

  static createGetOneRoute(models, modelName, driver, router) {
    router.get(
      `/${modelName}/:id`,
      ...models[modelName].hooks.getOne.willQuery,
      async (req, res, next) => {
        try {
          next();
        } catch (err) {
          res.status(500).send(err.message);
        }
      },
      ...models[modelName].hooks.getOne.didQuery,
      (req, res) => {
        res.status(200).send(res.data);
      }
    );
  }

  static createGetManyRoute(models, modelName, driver, router) {
    router.get(
      `/${modelName}`,
      ...models[modelName].hooks.getOne.willQuery,
      ...models[modelName].hooks.getOne.didQuery,
      (req, res) => {
        res.status(200).send(res.data);
      }
    );
  }

  static createPostRoute(models, modelName, driver, router) {
    router.post(
      `/${modelName}`,
      ...models[modelName].hooks.getOne.willValidate,
      ...models[modelName].hooks.getOne.didValidateWillWrite,
      ...models[modelName].hooks.getOne.didWrite,
      (req, res) => {
        res.status(201).send(res.data);
      }
    );
  }

  static createPatchRoute(models, modelName, driver, router) {
    router.patch(
      `/${modelName}/:id`,
      ...models[modelName].hooks.getOne.willValidate,
      ...models[modelName].hooks.getOne.didValidateWillWrite,
      ...models[modelName].hooks.getOne.didWrite,
      (req, res) => {
        res.status(200).send(res.data);
      }
    );
  }

  static createDeleteRoute(models, modelName, driver, router) {
    router.delete(
      `/${modelName}/:id`,
      ...models[modelName].hooks.getOne.willDelete,
      ...models[modelName].hooks.getOne.didDelete,
      (req, res) => {
        res.status(200).send(res.data);
      }
    );
  }

  static createRoutes(models, modelName, driver, router) {
    Router.createGetOneRoute(models, modelName, driver, router);
    Router.createGetManyRoute(models, modelName, driver, router);
    Router.createPostRoute(models, modelName, driver, router);
    Router.createPatchRoute(models, modelName, driver, router);
    Router.createDeleteRoute(models, modelName, driver, router);
  }

}

module.exports = Router;
