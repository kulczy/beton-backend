const teamCtrl = require('../controllers/team.controller');
const gameCtrl = require('../controllers/game.controller');
const memberCtrl = require('../controllers/member.controller');
const teamDataUtils = require('../utils/team-data');

/**
 * Add new team
 */
exports.teamInsert = async (req, res) => {
  try {
    const newTeam = await teamCtrl.insertTeam(req.body);
    const newMember = await memberCtrl.insertMember({
      join_at: new Date(),
      id_team: newTeam._id_team,
      id_user: req.auth._id_user,
      is_member: 1,
      is_admin: 1,
      is_creator: 1
    });
    res.status(200).send({ newTeam, newMember });
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Update team
 */
exports.teamUpdate = async (req, res) => {
  try {
    const update = await teamCtrl.updateTeam(req.params._id_team, req.body);
    res.status(200).send({ resp: update });
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Delete team
 */
exports.teamDelete = async (req, res) => {
  try {
    const teamMembers = await memberCtrl.findMembersByTeamID(
      req.params._id_team
    );
    const remove = await teamCtrl.deleteTeam(req.params._id_team);

    // Sockets: emit to all team members to remove memberships
    teamMembers.forEach((m) => {
      req.ioMember
        .in(`ioMember_${m.id_user}`)
        .emit('memberDelete', { id_team: req.params._id_team });
    });
    // Sockets: emit to team
    req.ioTeam.in(`ioTeam_${req.params._id_team}`).emit('teamDelete', null);

    res.status(200).send({ resp: remove });
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Get basic team by ID
 */
exports.teamGet = async (req, res) => {
  try {
    const team = await teamCtrl.getTeam(req.params._id_team);
    res.status(200).send(team);
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Get full team data by URL
 */
exports.teamFullGet = async (req, res) => {
  try {
    let team = await teamCtrl.getFullTeam(req.params.url);
    const plainTeam = team.get({ plain: true });
    team = teamDataUtils.remodelTeamData(plainTeam); // Rearange team data
    team = teamDataUtils.sortGames(team); // Sort games
    res.status(200).send(team);
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Get partial team data (name etc., and mambers)
 */
exports.teamGetBasic = async (req, res) => {
  try {
    let team = await teamCtrl.getTeamDataWithMembers(req.params.url);
    let games = await gameCtrl.getGamesWithTypes(team._id_team);
    let plainTeam = team.get({ plain: true });

    plainTeam = Object.assign({}, plainTeam, teamDataUtils.takeOutTypes(games)); // Teka out types from games
    plainTeam = teamDataUtils.remodelTeamData(plainTeam); // Rearange team data
    plainTeam = teamDataUtils.sortGames(plainTeam); // Sort games

    res.status(200).send(plainTeam);
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Get portion of games for team
 */
exports.teamGetFill = async (req, res) => {
  try {
    let team = await teamCtrl.getTeamDataWithMembers(req.params.url, false);
    let games = await gameCtrl.getGamesWithTypes(team._id_team, JSON.parse(req.query.exclude));
    let plainTeam = team.get({ plain: true });

    plainTeam = Object.assign({}, { members: plainTeam.members }, teamDataUtils.takeOutTypes(games)); // Teka out types from games
    plainTeam = teamDataUtils.remodelTeamData(plainTeam); // Rearange team data
    delete plainTeam.members;

    res.status(200).send(plainTeam);    
  } catch (err) {
    res.status(400).send(err);
  }
};

// Get team statistics
exports.teamStatistics = async (req, res) => {
  try {
    const team = await teamCtrl.getFullTeam(req.params.url);
    const plainTeam = team.get({ plain: true });

    // Create statistics array with members   
    const statistics = []; 
    plainTeam.members.forEach(m => {
      if (m.is_member === 1) {
        statistics.push({
          id_user: m.user._id_user,
          username: m.user.username,
          photo: m.user.photo,
          games: 0,
          wins: 0
        });
      }
    });

    // Fill statistics
    const closeGames = plainTeam.types.forEach(t => {
      const game = plainTeam.games.find(
        g => g._id_game === t.id_game 
          && new Date(g.close_at).getTime() < new Date().getTime() 
          && g.score_a !== null 
          && g.score_b !== null 
      );   
      if (game) {
        const userIndex = statistics.findIndex(m => m.id_user === t.id_user);
        if (userIndex !== -1) {
          statistics[userIndex].games = statistics[userIndex].games + 1;
          statistics[userIndex].wins = t.type_a === game.score_a && t.type_b === game.score_b ? statistics[userIndex].wins + 1 : statistics[userIndex].wins;
        }
      }
    });

    // Extra info
    const info = {
      totalGames: plainTeam.games.length,
      totalMembers: statistics.length,
      created_at: plainTeam.created_at
    }

    res.status(200).send({ statistics, info });
  } catch (err) {
    res.status(400).send(err);
  }
};