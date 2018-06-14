class HookValidator {

  static validateHttpMethodHooks(httpMethodHooks, hookTypes) {
    for (let hookType of hookTypes) {
      if (!httpMethodHooks[hookType]) {
        httpMethodHooks[hookType] = [];
      }
      if (!(httpMethodHooks[hookType] instanceof Array)) {
        return false;
      }
      for (let item of httpMethodHooks[hookType]) {
        if (typeof item !== 'function') {
          return false;
        }
      }
    }
  }

  static validateHooks(model) {
    if (!model.hooks) {
      model.hooks = {};
    }
    if (!(model.hooks instanceof Object)) {
      return false;
    }
    for (let httpMethod of ['getOne', 'getMany', 'post', 'patch', 'delete']) {
      if (!model.hooks[httpMethod]) {
        model.hooks[httpMethod] = {};
      }
      if (!(model.hooks[httpMethod] instanceof Object)) {
        return false;
      }
      if (httpMethod === 'getOne' || httpMethod === 'getMany') {
        HookValidator.validateHttpMethodHooks(model.hooks[httpMethod], [
          'willQuery',
          'didQuery'
        ]);
      }
      if (httpMethod === 'post' || httpMethod === 'patch') {
        HookValidator.validateHttpMethodHooks(model.hooks[httpMethod], [
          'willValidate',
          'didValidateWillWrite',
          'didWrite'
        ]);
      }
      if (httpMethod === 'delete') {
        HookValidator.validateHttpMethodHooks(model.hooks[httpMethod], [
          'willDelete',
          'didDelete'
        ]);
      }
    }
    return true;
  }

}

module.exports = HookValidator;
