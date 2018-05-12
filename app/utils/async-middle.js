const boom = require('boom');

const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.log('ERROR FROM ASYNC MIDDLE________________');
    if (!err.isBoom) {
      return next(boom.badImplementation(err));
    }
    next(err);
  });
};

module.exports = asyncMiddleware;
