const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Sequelize = require('sequelize');
const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');

// App and middleware
const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.FRONT_CORS_PATH }));

// Facebook auth
const fbTokenStrategy = require('./utils/facebook-token-strategy');
app.use(passport.initialize());
passport.use(new FacebookTokenStrategy(fbTokenStrategy.config, fbTokenStrategy.func));

// Router
const router = express.Router();
app.use('/v1/api', router);

// Routes
const mGame = require('./middleware/game.mid');
const mMember = require('./middleware/member.mid');
const mTeam = require('./middleware/team.mid');
const mType = require('./middleware/type.mid');
const mUser = require('./middleware/user.mid');

router.route('/').get((req, res) => res.status(200).send('Elo world! :D')); // Index

router.route('/team').post(mTeam.teamInsert); // Add new team
router.route('/team/:_id_team').patch(mTeam.teamUpdate); // Update team
router.route('/team/:_id_team').delete(mTeam.teamDelete); // Delete team
router.route('/team/:_id_team').get(mUser.verifyToken, mTeam.teamGet); // Get basic team by ID
router.route('/full_team/:url').get(mTeam.teamFullGet); // Get full team data by URL

router.route('/member').post(mMember.memberInsert); // Add new member
router.route('/member/:_id_member').patch(mMember.memberUpdate); // Update member status
router.route('/member/:_id_member').delete(mMember.memberDelete); // Delete membership

router.route('/game').post(mGame.gameInsert); // Add new game
router.route('/game/:_id_game').patch(mGame.gameUpdate); // Update game data
router.route('/game/:_id_game').delete(mGame.gameDelete); // Delete game

router.route('/type').post(mType.typeInsert); // Add new type
router.route('/type/:_id_type').patch(mType.typeUpdate); // Update type
router.route('/type/:_id_type').delete(mType.typeDelete); // Delete type

router.route('/user').post(mUser.userInsert); // Add new user
router.route('/user/:_id_user').patch(mUser.userUpdate); // Update user data
router.route('/user/:_id_user').delete(mUser.userDelete); // Delete user
router.route('/user/:email').get(mUser.userGetByEmail); // Get user by email

router.route('/utils/member_status').get(mTeam.teamGetMemberStatus); // Check if user is team member by URL
router.route('/utils/auth').get(passport.authenticate('facebook-token', { session: false }), mUser.userAuth); // User auth

module.exports = app;
