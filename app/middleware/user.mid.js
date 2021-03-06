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
    // Response object
    const resp = { deleted: false };

    // Get all user memberships
    const userMemberships = await memberCtrl.getUserMemberships(req.params._id_user);

    // Count teams that the user is admin
    const isAdmin = (userMemberships.filter(m => m.is_admin === 1)).length;

    // Delete user if is not admin in any team
    if (isAdmin === 0) {
      const user = await userCtrl.deleteUser(req.params._id_user);
      resp.user = user;
      resp.deleted = true;

      userMemberships.forEach(m => {
        req.ioTeam
          .in(`ioTeam_${m.id_team}`)
          .emit('memberDelete', { id_user: req.params._id_user });
      });
    }

    // Send response
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
    res.status(200).send({ user, serverTime: new Date()});
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
