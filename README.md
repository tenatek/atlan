# Atlan

A framework to build REST APIs with Express and MongoDB. 

[![npm version](https://img.shields.io/npm/v/atlan.svg)](https://www.npmjs.com/package/atlan)
[![npm downloads](https://img.shields.io/npm/dm/atlan.svg)](https://www.npmjs.com/package/atlan)
[![build status](https://travis-ci.org/tenatek/atlan.svg?branch=master)](https://travis-ci.org/tenatek/atlan)
[![coverage status](https://coveralls.io/repos/github/tenatek/atlan/badge.svg?branch=master&service=github)](https://coveralls.io/github/tenatek/atlan?branch=master)

It includes the following features:

* Data sent to the API is validated against the appropriate schema.
* Hooks can be defined to run code before validation and before/after database operations.
* MongoDB's rich query capabilities can be leveraged through the use of URL query strings in `GET` requests.
* You retain full control of your database and Express app.

## Installation

Just do:

```shell
npm install --save atlan
```

And then:

```javascript
const atlan = require('atlan');
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
   const jedi = {
     schema: {
       name: {
         type: 'string',
         required: true
       },
       lightsaberColor: {
         type: 'string',
         required: true
       },
       killedByAnakin: {
         type: 'boolean'
       },
       battlesFought: {
         type: 'array',
         items: {
           type: 'string'
         }
       }
     }
   };
   ```

3. Create a connection to your MongoDB database.

   ```javascript
   let connection = await MongoClient.connect(mongoUrl);
   let database = connection.db('sw-characters');
   ```

4. Start the engine.

   ```javascript

   let atlan = new Atlan(database, { jedi });
   let jediApi = atlan.api();
   ```

5. Plug into your Express app.

   ```javascript
   let app = express();

   app.use('/api', jediApi);

   app.listen(port);
   ```

6. Voilá!

   You can now make CRUD Web requests. For instance:

   ```http
   POST /api/jedi

   {
     "name": "Windu",
     "lightsaberColor": "purple",
     "killedByAnakin": true,
     "battlesFought": [
       "Naboo Crisis",
       "Clone Wars"
     ]
   }
   ```

   Will persist the data to the database and return a `201 Created` status code with the `_id` of the new document.

   Then doing:

   ```http
   GET /api/jedi?killedByAnakin=true
   ```

   Will return a `200 OK` code along with the data:

   ```json
   [
     {
       "_id": "5abf5e3b3efd1720595cc82f",
       "name": "Windu",
       "lightsaberColor": "purple",
       "killedByAnakin": true,
       "battlesFought": [
         "Naboo Crisis",
         "Clone Wars"
       ]
     }
   ]
   ```
