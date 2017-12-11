const query = require('../package/query')

test('connects and queries', () => {
  query.findById('Sites', '59cb3c56e49b194cb0249699').then((data) => {
    console.log(data)
  })
})
