# Atlan

Quickly create a CRUD API with Express and MongoDB.

## Installation

`npm install --save atlan`

## How to use

1. Declare your models and hooks in a JSON object

```javascript
const user = {
  schema: {
    name: {
      type: 'string',
      required: true
    },
    email: {
      type: 'string',
      required: true
    },
    posts: {
      type: 'array',
      elements: {
        type: 'ref',
        model: 'post'
      }
    }
  },

  hooks: {
    getOne: {
      filter(data, authorization) {
        return {
          name: data.name
        };
      }
    }
  }
};

const post = {
  schema: {
    title: {
      type: 'string',
      required: true
    },
    body: {
      type: 'string',
      required: true
    },
    likes: {
      type: 'number'
    },
    publisher: {
      type: 'ref',
      model: 'user',
      required: true
    }
  }
};
```

2. Plug into Express

```javascript
const app = Express();
const api = new Atlan();

Express().use('/api', api.router());
```

3. Plug into the Mongo driver and tell Atlan about your models

```javascript
MongoClient.connect(url, (err, db) => {
  api.driver(err, db);
  api.model([['post', user]]);
});
```

4. Start the server

```javascript
app.listen(process.env.PORT);
```
