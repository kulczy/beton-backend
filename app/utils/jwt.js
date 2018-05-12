const jwt = require('jsonwebtoken');

/**
 * Generate new token
 * @param {int} _id_user
 */
exports.generateToken = (_id_user) => {
  return jwt.sign({ _id_user }, process.env.JWT_SECRET, {
    expiresIn: 60 * 120
  });
};

/**
 * Verify token
 * @param {string} token
 */
exports.verifyToken = (token) => {
  // return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) =>
  //   cb(err, decoded)
  // );
  return jwt.verify(token, process.env.JWT_SECRET);
};
