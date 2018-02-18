module.exports = {
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
