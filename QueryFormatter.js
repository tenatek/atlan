function search(param, query) {
  query.$text = {
    $search: param
  };
}

function format(params) {
  let query = {};
  if (params._search) search(params._search, query);
  return query;
}

module.exports = { format };
