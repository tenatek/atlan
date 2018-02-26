const Util = require('./Util');

function validateHooks(hooks) {
  if (hooks == null || hooks.constructor !== Object) {
    return false;
  }
  if (
    !Util.checkPossibleKeys(hooks, [
      'getOne',
      'getMany',
      'post',
      'patch',
      'delete'
    ])
  ) {
    return false;
  }
  for (let method in hooks) {
    if (hooks[method] == null || hooks[method].constructor !== Object) {
      return false;
    }
    if (!Util.checkPossibleKeys(hooks[method], ['auth', 'before', 'after'])) {
      return false;
    }
    for (let hook in hooks[method]) {
      if (
        hooks[method][hook] == null ||
        hooks[method][hook].constructor !== Function
      ) {
        return false;
      }
    }
  }
  return true;
}

module.exports = { validateHooks };
