const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Sequelize = require('sequelize');

// Utils
const asyncMiddleware = require('./utils/async-middle');

// App and middleware
const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.FRONT_CORS_PATH }));

// Router
const router = express.Router();
app.use('/v1/api', router);

// Routes
const gameRoute = require('./routes/game.routes');
const memberRoute = require('./routes/member.routes');
const teamRoute = require('./routes/team.routes');
const typeRoute = require('./routes/type.routes');
const userRoute = require('./routes/user.routes');

router.route('/').get((req, res) => res.status(200).send('Elo world! :D')); // Index

router.route('/team').post(teamRoute.teamInsert); // Add new team
router.route('/team/:_id_team').patch(teamRoute.teamUpdate); // Update team
router.route('/team/:_id_team').delete(teamRoute.teamDelete); // Delete team
router.route('/team/:_id_team').get(teamRoute.teamGet); // Get basic team by ID
router.route('/full_team/:url').get(teamRoute.teamFullGet); // Get full team data by URL

router.route('/member').post(memberRoute.memberInsert); // Add new member
router.route('/member/:_id_member').patch(memberRoute.memberUpdate); // Update member status
router.route('/member/:_id_member').delete(memberRoute.memberDelete); // Delete membership

router.route('/game').post(gameRoute.gameInsert); // Add new game
router.route('/game/:_id_game').patch(gameRoute.gameUpdate); // Update game data
router.route('/game/:_id_game').delete(gameRoute.gameDelete); // Delete game

router.route('/type').post(typeRoute.typeInsert); // Add new type
router.route('/type/:_id_type').patch(typeRoute.typeUpdate); // Update type
router.route('/type/:_id_type').delete(typeRoute.typeDelete); // Delete type

router.route('/user').post(userRoute.userInsert); // Add new user
router.route('/user/:_id_user').patch(userRoute.userUpdate); // Update user data
router.route('/user/:_id_user').delete(userRoute.userDelete); // Delete user

router.route('/utils/member_status').get(teamRoute.teamGetMemberStatus); // Check if user is team member by URL

module.exports = app;
