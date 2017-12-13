module.exports = {

  schema: {
    title: {
      type: 'string',
      required: true
    },
    likes: {
      type: 'number'
    },
    body: {
      type: 'string',
      required: true
    },
    publisher: {
      type: 'ref',
      model: 'user',
      required: true
    }
  }

};
