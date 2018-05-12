const userCtrl = require('../controllers/user.controller');

/**
 * Add new user
 */
exports.userInsert = async (req, res) => {
  try {
    const newUser = await userCtrl.insertUser(req.body);
    res.status(200).send(newUser);
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Update user
 */
exports.userUpdate = async (req, res) => {
  try {
    const user = await userCtrl.updateUser(req.params._id_user, req.body);
    res.status(200).send({ resp: user });
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Delete user
 */
exports.userDelete = async (req, res) => {
  try {
    const user = await userCtrl.deleteUser(req.params._id_user);
    res.status(200).send({ resp: user });
  } catch (err) {
    res.status(400).send(err);
  }
};
