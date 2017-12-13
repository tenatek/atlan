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
      authorization(req) {
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
      authorization(req) {
        if (req.get('Authorization') === 'true') return 'AUTHORIZED';
        if (req.get('Authorization') === 'soso') return 'RESTRICTED';
        return null;
      },
      validation(data, authorization) {
        if (authorization === 'RESTRICTED') return false;
        return true;
      }
    }
  }

};
