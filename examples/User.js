module.exports = {

  schema: {
    name: {
      type: 'string',
      required: true
    },
    telephone: {
      type: 'number'
    },
    email: {
      type: 'string',
      required: true
    },
    permissions: {
      type: 'object',
      required: true,
      children: {
        test: {
          type: 'number',
          required: true
        }
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
