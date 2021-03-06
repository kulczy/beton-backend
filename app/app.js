const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Sequelize = require('sequelize');
const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');
const socketIO = require('socket.io');
const http = require('http');

// App and middleware
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cors({ origin: process.env.FRONT_CORS_PATH }));
app.use(cors());

// Start socket
require('./socket.js')(io, app);

// Facebook auth
const fbTokenStrategy = require('./utils/facebook-token-strategy');
app.use(passport.initialize());
passport.use(new FacebookTokenStrategy(fbTokenStrategy.config, fbTokenStrategy.func));

// Static sites
app.use(express.static('public'));
app.get('/', function(req, res) {
  res.sendFile('/public/index.html', { root: '.' });
});
app.get('/app', function(req, res) {
  res.sendFile('/public/index.html', { root: '.' });
});
app.get('/app/*', function(req, res) {
  res.sendFile('/public/index.html', { root: '.' });
});

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

router.route('/team').post(mUser.isLoggedIn, mTeam.teamInsert); // Add new team
router.route('/team/:_id_team').patch(mUser.isLoggedIn, mMember.is.adminByID, mTeam.teamUpdate); // Update team
router.route('/team/:_id_team').delete(mUser.isLoggedIn, mMember.is.adminByID, mTeam.teamDelete); // Delete team
router.route('/team/:_id_team').get(mUser.isLoggedIn, mMember.is.memberByID, mTeam.teamGet); // Get basic team by ID
router.route('/full_team/:url').get(mUser.isLoggedIn, mMember.is.memberByURL, mTeam.teamGetBasic); // Get full team data by URL
router.route('/fill_team/:url').get(mUser.isLoggedIn, mMember.is.memberByURL, mTeam.teamGetFill); // Get games portion

router.route('/statistics/:url').get(mUser.isLoggedIn, mMember.is.memberByURL, mTeam.teamStatistics); // Get full team statistics

router.route('/member').post(mUser.isLoggedIn, mMember.is.memberByID, mMember.memberInsert); // Add new member
router.route('/member/:_id_member').patch(mUser.isLoggedIn, mMember.is.memberAnyByID, mMember.memberUpdate); // Update member status
router.route('/member').delete(mUser.isLoggedIn, mMember.is.memberAnyByID, mMember.memberDelete); // Delete membership

router.route('/membership/:_id_user').get(mUser.isLoggedIn, mUser.isOwner, mMember.membershipGet); // Get all user membership
router.route('/membershipfull/:_id_user').get(mUser.isLoggedIn, mUser.isOwner, mMember.membershipGetFull); // Get all user membership with team data
router.route('/membershipcreatorcount/:_id_user').get(mUser.isLoggedIn, mUser.isOwner, mMember.membershipCreatorCount); // Count user teams he is created

router.route('/game').post(mUser.isLoggedIn, mMember.is.memberByID, mGame.gameInsert); // Add new game
router.route('/game/:_id_game').patch(mUser.isLoggedIn, mMember.is.memberByID, mGame.gameUpdate); // Update game data
router.route('/game/:_id_game').delete(mUser.isLoggedIn, mMember.is.memberByID, mGame.gameDelete); // Delete game

router.route('/type').post(mUser.isLoggedIn, mType.typeInsert); // Add new type
router.route('/type/:_id_type').patch(mUser.isLoggedIn, mType.typeUpdate); // Update type
router.route('/type/:_id_type').delete(mUser.isLoggedIn, mType.typeDelete); // Delete type

// router.route('/user').post(mUser.userInsert); // Add new user
router.route('/user/:_id_user').patch(mUser.isLoggedIn, mUser.isOwner, mUser.userUpdate); // Update user data
router.route('/user/:_id_user').delete(mUser.isLoggedIn, mUser.isOwner, mUser.userDelete); // Delete user
router.route('/user/:_id_user').get(mUser.isLoggedIn, mUser.isOwner, mUser.userGetByID); // Get user by ID
router.route('/user/:email').get(mUser.isLoggedIn, mUser.userGetByEmail); // Get user by email

router.route('/utils/member_status').get(mMember.is.membership); // Check if user is team member by URL
router.route('/utils/auth').get(passport.authenticate('facebook-token', { session: false }), mUser.userAuth); // User auth
router.route('/utils/time').get(mUser.isLoggedIn, (req, res) => { res.status(200).send({ time: new Date() }); }); // Return servertime

module.exports = server;
