modules.exports = {

  name: 'user',

  schema: {
    name: {
      type: 'string',
      required: true
    },
    email: {
      type: 'string',
      required: true
    },
    password: {
      type: 'string',
      required: true
    }
  },

    // getOne, getMany, create, update, delete

  restrict: function (headers, requestType) {
        // return string (e.g. 'SELF', 'ADMIN', 'END_USER')
  },

    // create, update

  validate: function (data) {
        // return boolean
  },

    // create, update

  process: function () {

  },

    // getOne, getMany

  filter: function () {

  }

}
