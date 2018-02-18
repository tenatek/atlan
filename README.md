# Atlan

Quickly create a CRUD API with Express and MongoDB.

## Installation

`npm install --save atlan`

## How to use

1. Declare your models and hooks in a JSON object

```javascript
const user = {
  name: {
    type: 'string',
    required: true
  },
  email: {
    type: 'string',
    required: true
  }
};
```

2. Plug into Express

```javascript
const app = Express();
const api = new Atlan();

Express().use('/api', api.router());
```

3. Plug into the Mongo driver and instantiate the models

```javascript
MongoClient.connect(url, (err, db) => {
  api.driver(err, db);
  api.model([['post', Post], ['user', User]]);
});
```

4. Start the server

```javascript
app.listen(process.env.PORT);
```
