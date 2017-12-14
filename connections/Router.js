const express = require('express');
const bodyParser = require('body-parser');

const ValidationEngine = require('../hooks/ValidationEngine');
const FilterEngine = require('../hooks/FilterEngine');
const AuthorizationEngine = require('../hooks/AuthorizationEngine');
const QueryEngine = require('../hooks/QueryEngine');

// TODO: this should be the package's entrypoint

class Router {
  constructor() {
    this.router = express.Router();
    this.router.use(bodyParser.json());
  }

  addRoutes(model, middleware, schemas) {
    this.addGetOne(model, middleware.getOne);
    this.addGetMany(model, middleware.getMany);
    this.addPost(model, middleware.post, schemas);
    this.addPatch(model, middleware.patch, schemas);
    this.addDelete(model, middleware.delete);
  }

  addGetOne(model, middleware) {
    let wrappers = [];

    // developer-defined authorization middleware, if it exists
    if (middleware.authorization) {
      wrappers.push(AuthorizationEngine.authorizationWrapper(middleware.authorization));
    }

    // package-defined query middleware
    wrappers.push(QueryEngine.queryWrapper(middleware.query, model, false));

    // developer-defined filter middleware, if it exists
    if (middleware.filter) wrappers.push(FilterEngine.filterWrapper(middleware.filter));

    this.router.get(`/${model}/:id`, ...wrappers, (req, res) => {
      res.status(200).send(res.locals.data);
    });
  }

  addGetMany(model, middleware) {
    let wrappers = [];

    // developer-defined authorization middleware, if it exists
    if (middleware.authorization) {
      wrappers.push(AuthorizationEngine.authorizationWrapper(middleware.authorization));
    }

    // package-defined query middleware
    wrappers.push(QueryEngine.queryWrapper(middleware.query, model, false));

    // developer-defined filter middleware, if it exists
    if (middleware.filter) wrappers.push(FilterEngine.filterWrapper(middleware.filter));

    this.router.get(`/${model}`, ...wrappers, (req, res) => {
      res.status(200).send(res.locals.data);
    });
  }

  addPost(model, middleware, schemas) {
    let wrappers = [];

    // developer-defined authorization middleware, if it exists
    if (middleware.authorization) {
      wrappers.push(AuthorizationEngine.authorizationWrapper(middleware.authorization));
    }

    // package-defined schema validation middleware
    wrappers
      .push(ValidationEngine.dataValidationWrapper(middleware.dataValidation, model, schemas));

    // developer-defined custom validation middleware, if it exists
    if (middleware.validation) {
      wrappers.push(ValidationEngine.validationWrapper(middleware.validation));
    }

    // package-defined query middleware
    wrappers.push(QueryEngine.queryWrapper(middleware.query, model, true));

    this.router.post(`/${model}`, ...wrappers, (req, res) => {
      res.sendStatus(201);
    });
  }

  addPatch(model, middleware, schemas) {
    let wrappers = [];

    // developer-defined authorization middleware, if it exists
    if (middleware.authorization) {
      wrappers.push(AuthorizationEngine.authorizationWrapper(middleware.authorization));
    }

    // package-defined schema validation middleware
    wrappers
      .push(ValidationEngine.dataValidationWrapper(middleware.dataValidation, model, schemas));

    // developer-defined custom validation middleware, if it exists
    if (middleware.validation) {
      wrappers.push(ValidationEngine.validationWrapper(middleware.validation));
    }

    // package-defined query middleware
    wrappers.push(QueryEngine.queryWrapper(middleware.query, model, true));

    this.router.patch(`/${model}/:id`, ...wrappers, (req, res) => {
      res.sendStatus(200);
    });
  }

  addDelete(model, middleware) {
    let wrappers = [];

    // developer-defined authorization middleware, if it exists
    if (middleware.authorization) {
      wrappers.push(AuthorizationEngine.authorizationWrapper(middleware.authorization));
    }

    // package-defined query middleware
    wrappers.push(QueryEngine.queryWrapper(middleware.query, model, false));

    this.router.delete(`/${model}/:id`, ...wrappers, (req, res) => {
      res.sendStatus(200);
    });
  }

}

module.exports = Router;
