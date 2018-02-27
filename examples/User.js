module.exports = {
  schema: {
    name: {
      type: 'string',
      required: true
    },
    email: {
      type: 'string',
      required: true
    },
    mentor: {
      type: 'ref',
      model: 'user'
    },
    picture: {
      type: 'file'
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
    post: {
      before(req, res, next) {
        next();
      }
    }
  }
};
