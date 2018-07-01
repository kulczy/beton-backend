const teamCtrl = require('../controllers/team.controller');
const gameCtrl = require('../controllers/game.controller');
const memberCtrl = require('../controllers/member.controller');
const typeCtrl = require('../controllers/type.controller');
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
    const team = await teamCtrl.getTeamDataWithMembers(req.params.url); // Get team data
    const games = await gameCtrl.getGames(team._id_team); // Get all team games
    const types = await typeCtrl.getTypes(team._id_team); // Get all team types

    // Create members statistics
    const statistics = team.members.map((member) => {
      return {
        id_user: member.id_user,
        username: member.user.username,
        photo: member.user.photo,
        games: 0,
        wins: 0,
        points: 0
      };
    });

    // Extend games data by winners and players
    const extendedGames = games.map((game) => {
      const plainGame = game.get({ plain: true });
      const gameTypes = types.filter((type) => type.id_game === plainGame._id_game); // Find types to this game
      const players = []; // Members whos play this game
      const winners = []; // Members whos type correct score

      // Fill players and winners if game score exist
      if (plainGame.score_a !== null && plainGame.score_b !== null) {
        gameTypes.forEach((type) => {
          players.push(type.id_user);
          if (type.type_a === plainGame.score_a && type.type_b === plainGame.score_b) {
            winners.push(type.id_user);
          }
        });
      }
      return { ...plainGame, players, winners };
    });

    // Fill members statistics
    extendedGames.forEach((game) => {
      game.players.forEach((player) => {
        const member = statistics.find(m => m.id_user === player);
        if (member) member.games = member.games + 1;
      });
      game.winners.forEach((player) => {
        const member = statistics.find(m => m.id_user === player);
        if (member) member.wins = member.wins + 1;
      });
    });

    // Compute accuracy
    statistics.map((member) => {
      member.accuracy = member.games > 0 ? Math.round((member.wins / member.games) * 100) : 0;
      return member;
    });

    // Compute points
    let pts = 0;
    extendedGames.forEach((game) => {
      pts = pts + game.players.length;
      if (game.winners.length) {
        const currPts = pts / game.winners.length;
        game.winners.forEach((winner) => {
          const member = statistics.find(m => m.id_user === winner);
          if (member) member.points = member.points + currPts;
        });
        pts = 0;
      }
    });

    // Points minus games
    statistics.map((member) => {
      member.points = Number((member.points - games.length).toFixed(1));
      return member;
    });

    // Other team stats
    const info = {
      totalGames: games.length,
      openGames: (games.filter(game => game.score_a === null || game.score_b === null)).length,
      totalMembers: statistics.length,
      created_at: team.created_at,
    };
    
    res.status(200).send({ info, statistics });
  } catch (err) {
    res.status(400).send(err);
  }
};