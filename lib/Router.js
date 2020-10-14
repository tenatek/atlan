const QueryBuilder = require('./QueryBuilder');
const Util = require('./Util');

class Router {

  constructor(driver, router, configHandler, resourceValidator) {
    this.driver = driver;
    this.router = router;
    this.configHandler = configHandler;
    this.resourceValidator = resourceValidator;
  }

  createGetOneRoute(modelName) {
    this.router.get(
      `/${modelName}/:id`,
      this.configHandler.getHooks(modelName, 'getOne', 'willQuery'),
      async (req, res, next) => {
        let queryBuilder = new QueryBuilder(
          modelName,
          req.query,
          this.configHandler
        );
        try {
          [res.data] = await this.driver.getDocs(
            modelName,
            Util.wrapId(req.params.id),
            queryBuilder.buildPopulateQuery(),
            []
          );
          next();
        } catch (err) {
          next(err);
        }
      },
      this.configHandler.getHooks(modelName, 'getOne', 'didQuery'),
      (req, res) => {
        res.status(200).send(res.data);
      }
    );
  }

  createGetManyRoute(modelName) {
    this.router.get(
      `/${modelName}`,
      this.configHandler.getHooks(modelName, 'getMany', 'willQuery'),
      async (req, res, next) => {
        let queryBuilder = new QueryBuilder(
          modelName,
          req.query,
          this.configHandler
        );
        try {
          res.data = await this.driver.getDocs(
            modelName,
            await queryBuilder.buildQuery(),
            queryBuilder.buildPopulateQuery(),
            [],
            queryBuilder.buildSortQuery()
          );
          next();
        } catch (err) {
          next(err);
        }
      },
      this.configHandler.getHooks(modelName, 'getMany', 'didQuery'),
      (req, res) => {
        res.status(200).send(res.data);
      }
    );
  }

  createPostRoute(modelName) {
    this.router.post(
      `/${modelName}`,
      this.configHandler.getHooks(modelName, 'post', 'willValidate'),
      async (req, res, next) => {
        try {
          await this.resourceValidator.validate(modelName, req.body, true);
          next();
        } catch (err) {
          next(err);
        }
      },
      this.configHandler.getHooks(modelName, 'post', 'didValidateWillWrite'),
      async (req, res, next) => {
        try {
          res.data = await this.driver.insertDoc(modelName, req.body);
          next();
        } catch (err) {
          next(err);
        }
      },
      this.configHandler.getHooks(modelName, 'post', 'didWrite'),
      (req, res) => {
        res.status(201).send(res.data);
      }
    );
  }

  createPatchRoute(modelName) {
    this.router.patch(
      `/${modelName}/:id`,
      this.configHandler.getHooks(modelName, 'patch', 'willValidate'),
      async (req, res, next) => {
        try {
          await this.resourceValidator.validate(modelName, req.body, false);
          next();
        } catch (err) {
          next(err);
        }
      },
      this.configHandler.getHooks(modelName, 'patch', 'didValidateWillWrite'),
      async (req, res, next) => {
        try {
          await this.driver.updateDoc(modelName, req.params.id, req.body);
          next();
        } catch (err) {
          next(err);
        }
      },
      this.configHandler.getHooks(modelName, 'patch', 'didWrite'),
      (req, res) => {
        res.sendStatus(200);
      }
    );
  }

  createDeleteRoute(modelName) {
    this.router.delete(
      `/${modelName}/:id`,
      this.configHandler.getHooks(modelName, 'delete', 'willDelete'),
      async (req, res, next) => {
        try {
          await this.driver.deleteDoc(modelName, req.params.id);
          next();
        } catch (err) {
          next(err);
        }
      },
      this.configHandler.getHooks(modelName, 'delete', 'didDelete'),
      (req, res) => {
        res.sendStatus(200);
      }
    );
  }

  setErrorHandler(modelName) {
    this.router.use(
      [`/${modelName}`, `/${modelName}/**`],
      this.configHandler.getErrorHandler(modelName)
    );
  }

  createRoutes(modelName) {
    this.createGetOneRoute(modelName);
    this.createGetManyRoute(modelName);
    this.createPostRoute(modelName);
    this.createPatchRoute(modelName);
    this.createDeleteRoute(modelName);
    this.setErrorHandler(modelName);
  }

}

module.exports = Router;
