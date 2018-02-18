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
      authorize(req) {
        if (req.get('Authorization') === 'true') return 'AUTHORIZED';
        if (req.get('Authorization') === 'soso') return 'RESTRICTED';
        return null;
      },
      filter(data, authorization) {
        if (authorization === 'AUTHORIZED') return data;
        if (authorization === 'RESTRICTED') {
          return {
            name: data.name
          };
        }
        return null;
      }
    },
    post: {
      authorize(req) {
        if (req.get('Authorization') === 'true') return 'AUTHORIZED';
        if (req.get('Authorization') === 'soso') return 'RESTRICTED';
        return null;
      },
      check(data, authorization) {
        if (authorization === 'RESTRICTED') return false;
        return true;
      }
    }
  }
};
