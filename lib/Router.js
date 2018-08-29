const QueryBuilder = require('./QueryBuilder');
const Util = require('./Util');

class Router {

  constructor(driver, router, configHolder, queryBuilder, resourceValidator) {
    this.driver = driver;
    this.router = router;
    this.configHolder = configHolder;
    this.queryBuilder = queryBuilder;
    this.resourceValidator = resourceValidator;
  }

  createGetOneRoute(modelName) {
    this.router.get(
      `/${modelName}/:id`,
      this.configHolder.getHooks(modelName, 'getOne', 'willQuery'),
      async (req, res, next) => {
        try {
          [res.data] = await this.driver.getDocs(
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
      this.configHolder.getHooks(modelName, 'getOne', 'didQuery'),
      (req, res) => {
        res.status(200).send(res.data);
      }
    );
  }

  createGetManyRoute(modelName) {
    this.router.get(
      `/${modelName}`,
      this.configHolder.getHooks(modelName, 'getMany', 'willQuery'),
      async (req, res, next) => {
        try {
          res.data = await this.driver.getDocs(
            modelName,
            this.queryBuilder.buildQuery(modelName, req.query),
            QueryBuilder.getModelsToPopulate(req.query),
            [],
            QueryBuilder.buildSortQuery(req.query)
          );
          next();
        } catch (err) {
          next(err);
        }
      },
      this.configHolder.getHooks(modelName, 'getMany', 'didQuery'),
      (req, res) => {
        res.status(200).send(res.data);
      }
    );
  }

  createPostRoute(modelName) {
    this.router.post(
      `/${modelName}`,
      this.configHolder.getHooks(modelName, 'post', 'willValidate'),
      async (req, res, next) => {
        try {
          await this.resourceValidator.validate(modelName, req.body, true);
          next();
        } catch (err) {
          next(err);
        }
      },
      this.configHolder.getHooks(modelName, 'post', 'didValidateWillWrite'),
      async (req, res, next) => {
        try {
          res.data = await this.driver.insertDoc(modelName, req.body);
          next();
        } catch (err) {
          next(err);
        }
      },
      this.configHolder.getHooks(modelName, 'post', 'didWrite'),
      (req, res) => {
        res.status(201).send(res.data);
      }
    );
  }

  createPatchRoute(modelName) {
    this.router.patch(
      `/${modelName}/:id`,
      this.configHolder.getHooks(modelName, 'patch', 'willValidate'),
      async (req, res, next) => {
        try {
          await this.resourceValidator.validate(modelName, req.body, false);
          next();
        } catch (err) {
          next(err);
        }
      },
      this.configHolder.getHooks(modelName, 'patch', 'didValidateWillWrite'),
      async (req, res, next) => {
        try {
          await this.driver.updateDoc(modelName, req.params.id, req.body);
          next();
        } catch (err) {
          next(err);
        }
      },
      this.configHolder.getHooks(modelName, 'patch', 'didWrite'),
      (req, res) => {
        res.sendStatus(200);
      }
    );
  }

  createDeleteRoute(modelName) {
    this.router.delete(
      `/${modelName}/:id`,
      this.configHolder.getHooks(modelName, 'delete', 'willDelete'),
      async (req, res, next) => {
        try {
          await this.driver.deleteDoc(modelName, req.params.id);
          next();
        } catch (err) {
          next(err);
        }
      },
      this.configHolder.getHooks(modelName, 'delete', 'didDelete'),
      (req, res) => {
        res.sendStatus(200);
      }
    );
  }

  setErrorHandler(modelName) {
    this.router.use(
      [`/${modelName}`, `/${modelName}/**`],
      this.configHolder.getErrorHandler(modelName)
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
