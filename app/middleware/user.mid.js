const userCtrl = require('../controllers/user.controller');
const memberCtrl = require('../controllers/member.controller');
const jwt = require('../utils/jwt');

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
    console.log(err);
    res.status(400).send(err);
  }
};

/**
 * Delete user
 */
exports.userDelete = async (req, res) => {
  try {
    const resp = { deleted: false };
    const userTeams = await memberCtrl.getUserMemberships(req.params._id_user, true);
    if (!userTeams.length) {
      const user = await userCtrl.deleteUser(req.params._id_user);
      resp.deleted = true;
      resp.user = user;
    }
    res.status(200).send(resp);
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Get user by email
 */
exports.userGetByEmail = async (req, res) => {
  try {
    const user = await userCtrl.getUserByEmail(req.params.email);
    res.status(200).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Get user by ID
 */
exports.userGetByID = async (req, res) => {
  try {
    const user = await userCtrl.getUserByID(req.params._id_user);
    res.status(200).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * User facebook authentication
 */
exports.userAuth = async (req, res) => {
  const facebookData = {
    facebook_id: req.user.id,
    username: req.user.first_name,
    email: req.user.email,
    photo: req.user.picture.data.url
  };
  let user;

  try {
    // Check if user already exist
    const userExist = await userCtrl.getUserByFacebookID(req.user.id);

    // If user exist, update some data,
    // else insert new user
    // both returned fresh user data
    if (userExist) {
      await userCtrl.updateUser(userExist._id_user, {
        email: facebookData.email,
        photo: facebookData.photo
      });
      user = userExist;
      user.email = facebookData.email;
      user.photo = facebookData.photo;
    } else {
      user = await userCtrl.insertUser(facebookData);
    }

    // Generate new JWT token
    const token = jwt.generateToken(user._id_user);

    res.status(200).send({ token });
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Check if token is valid
 * and add data from token to request
 */
exports.isLoggedIn = async (req, res, next) => {
  try {
    req.auth = jwt.verifyToken(req.headers['x-auth-token']);
    const userExist = await userCtrl.getUserByID(req.auth._id_user);
    if (!userExist) throw { msg: 'user not exist' };
    next();
  } catch (err) {
    res.status(401).send(err);
  }
};

/**
 * Check if user from query 
 * is the same as user from token
 */
exports.isOwner = (req, res, next) => {
  const idFromQuery = req.params._id_user || req.body.id_user;
  const idFromToken = req.auth._id_user;
  if (idFromQuery == idFromToken) next();
  else res.status(403).send('you do not have permission');
};
