const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const Atlan = require('../Atlan.js');

const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://test:test@ds147534.mlab.com:47534/api-test';

let api = new Atlan();

app.use('/api', api.router());

MongoClient.connect(url, (err, db) => {
  api.driver(err, db);
  api.model('user', {
    name: {
      type: 'string',
      required: true
    },
    telephone: {
      type: 'number'
    },
    email: {
      type: 'string',
      required: true
    },
    permissions: {
      type: 'object',
      required: true,
      children: {
        test: {
          type: 'number',
          required: true
        }
      }
    }
  }, {
    getOne: {
      authorization(req) {
        if (req.get('Authorization') == 'true') return 'AUTHORIZED';
        if (req.get('Authorization') == 'soso') return 'RESTRICTED';
        return null;
      },
      filter(data, authorization) {
        if (authorization === 'AUTHORIZED') return data;
        if (authorization === 'RESTRICTED') {
          return {
            name: data.name
          };
        }
      }
    },
    post: {
      authorization(req) {
        if (req.get('Authorization') == 'true') return 'AUTHORIZED';
        if (req.get('Authorization') == 'soso') return 'RESTRICTED';
        return null;
      },
      validation(data, authorization) {
        if (authorization === 'RESTRICTED') return false;
        return true;
      }
    }
  });
});

app.listen(process.env.PORT || 9000);
