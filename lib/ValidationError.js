class ValidationError extends Error {

  constructor(message, validationResult) {
    super(message);
    this.name = 'ValidationError';
    this.validationResult = validationResult;
  }

}

module.exports = ValidationError;
