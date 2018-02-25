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
      type: 'file',
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
      auth(req) {
        if (req.get('Authorization') === 'true') {
          return 'AUTHORIZED';
        }
        return null;
      }
    },
    post: {
      auth(req) {
        if (req.get('Authorization') === 'true') {
          return 'AUTHORIZED';
        }
        return null;
      },
      before(authorization, req) {
        req.body.picture = req.files.picture[0].fieldname;
        return true;
      }
    }
  }
};
