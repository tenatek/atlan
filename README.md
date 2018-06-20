# Atlan

A framework that takes in your database schemas, and creates a full-blown Web CRUD API. For use with Express and MongoDB.

It includes the following features:

* Data sent to the API is validated against the appropriate schema.
* Hooks can be defined to run code before validation and before/after database operations.
* MongoDB's rich query capabilities can be leveraged through the use of URL query strings in `GET` requests.

## Installation

Just do:

`npm install --save atlan`

And then:

```javascript
const atlan = require('atlan');
```

## Quick start

1. Declare a JSON schema.

  ```javascript
  const jedi = {
    schema: {
      type: 'object',
      properties: {
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
    }
  };
  ```

2. Create a connection to your MongoDB database.

  ```javascript
  const connection = await MongoClient.connect(mongoUrl);
  ```

3. Start the engine.

  ```javascript
  const jediApi = atlan(connection, { jedi });
  ```

4. Plug into your Express app.

  ```javascript
  const express = require('express');
  const app = express();

  app.use('/api', jediApi);

  app.listen(port);
  ```

5. Voilá!

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
  ```
