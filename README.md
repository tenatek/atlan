[![Atlan](https://atlan.tenatek.com/img/logo-purple.png | height=100)](https://atlan.tenatek.com)

A framework to build REST APIs with Express and MongoDB. 

[![npm version](https://img.shields.io/npm/v/atlan.svg)](https://www.npmjs.com/package/atlan)
[![npm downloads](https://img.shields.io/npm/dm/atlan.svg)](https://www.npmjs.com/package/atlan)
[![build status](https://travis-ci.org/tenatek/atlan.svg?branch=master)](https://travis-ci.org/tenatek/atlan)
[![coverage status](https://coveralls.io/repos/github/tenatek/atlan/badge.svg?branch=master)](https://coveralls.io/github/tenatek/atlan?branch=master)

Atlan takes in your database connection and your resource schemas, and outputs a ready-to-use Express router with `GET`, `POST`, `PATCH` and `DELETE` routes for each resource type.

Atlan includes the following features:

* Server-side validation against your schemas,
* You can define hooks to run code before validation and before/after database operations,
* MongoDB's rich query capabilities can be leveraged through the use of URL query strings in `GET` requests,
* You retain full control of your database and Express app.

The full docs are available [here](https://atlan.tenatek.com).

## Installation

Just do:

```shell
npm install --save atlan
```

## Quick start

1. Import the good stuff.

   ```javascript
   const express = require('express');
   const { MongoClient } = require('mongodb');
   const Atlan = require('atlan');
   ```

2. Declare a JSON schema.

   ```javascript
   const city = {
     schema: {
       name: {
         type: 'string',
         required: true
       },
       population: {
         type: 'number',
         required: true
       },
       isStateCapital: {
         type: 'boolean'
       },
       postCodes: {
         type: 'array',
         items: {
           type: 'number'
         }
       }
     }
   };
   ```

3. Create a connection to your MongoDB database.

   ```javascript
   let connection = await MongoClient.connect(mongoUrl);
   let database = connection.db('geo');
   ```

4. Start the engine.

   ```javascript

   let atlan = new Atlan(database, { city });
   let cityApi = atlan.api();
   ```

5. Plug into your Express app.

   ```javascript
   let app = express();

   app.use('/api', cityApi);

   app.listen(port);
   ```

6. Voilá!

   You can now make CRUD Web requests. For instance:

   ```http
   POST /api/city

   {
     "name": "Miami",
     "population": 5000000,
     "isStateCapital": false,
     "postCodes": [
       33110,
       33109,
       33111
     ]
   }
   ```

   Will persist the data to the database and return a `201 Created` status code with the `_id` of the new document.

   Then doing:

   ```http
   GET /api/city?population_gt=400000
   ```

   Will return a `200 OK` code along with the data:

   ```json
   [
     {
       "_id": "5abf5e3b3efd1720595cc82f",
       "name": "Miami",
       "population": 453000,
       "postCodes": [
         33110,
         33109,
         33111
       ]
     }
   ]
   ```
