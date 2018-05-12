const models = require('../models');
const { User } = models;

/**
 * Add new user
 * @param {object} userData object contains all user data:
 * facebook_id, username, email, photo, public
 */
exports.insertUser = async (userData) => {
  const newUser = await User.build(userData);
  return newUser.save();
};

/**
 * Update user data
 * @param {int} _id_user
 * @param {object} userData object contains some update data:
 * username, email, photo, is_public
 */
exports.updateUser = async (_id_user, userData) => {
  return await User.update(userData, { where: { _id_user } });
};

/**
 * Delete user
 * @param {int} _id_user
 */
exports.deleteUser = async (_id_user) => {
  return await User.destroy({
    where: { _id_user }
  });
};

/**
 * Get user by facebook ID
 * @param {string} facebook_id
 */
exports.getUserByFacebookID = async (facebook_id) => {
  return await User.findOne({
    where: { facebook_id }
  })
};

/**
 * Get user by email
 * @param {string} email
 */
exports.getUserByEmail = async (email) => {
  return await User.findOne({
    where: { email }
  })
};
