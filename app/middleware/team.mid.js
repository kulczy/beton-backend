const teamCtrl = require('../controllers/team.controller');
const memberCtrl = require('../controllers/member.controller');

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
    team = remodelTeamData(team); // Rearange team data
    team = sortGames(team); // Sort games
    res.status(200).send(team);
  } catch (err) {
    res.status(400).send(err);
  }
};

function remodelTeamData(team) {
  // Create plain JSON from team
  const plainTeam = team.get({ plain: true });

  // Empty types object
  const newTypes = {};

  // Create member array
  plainTeam.members.forEach((member) => {
    newTypes[member.user._id_user] = {};
  });

  // Add types to members if member exist
  plainTeam.types.forEach((type) => {
    if (newTypes[type.id_user]) {
      newTypes[type.id_user][type.id_game] = type;
    }
  });

  // Remove useless data from team object
  delete plainTeam.types;

  // Add new types to team object
  plainTeam.types = newTypes;

  return plainTeam;
}

function sortGames(team) {
  const newTeam = Object.assign({}, team);
  const newGames = [];
  const gamesOpen = [];
  const gamesClosed = [];

  // Split games to open and slode
  newTeam.games.forEach((g) => {
    if (new Date(g.close_at).getTime() > new Date().getTime()) {
      gamesOpen.push(g);
    } else {
      gamesClosed.push(g);
    }
  });

  // Sort open games
  gamesOpen.sort(
    (a, b) => new Date(a.close_at).getTime() - new Date(b.close_at).getTime()
  );

  // Sort closed games
  gamesClosed.sort(
    (a, b) => new Date(b.close_at).getTime() - new Date(a.close_at).getTime()
  );

  newTeam.games = newGames.concat(gamesOpen, gamesClosed);

  return newTeam;
}

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
      const game = plainTeam.games.find(g => g._id_game === t.id_game && new Date(g.close_at).getTime() < new Date().getTime());   
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