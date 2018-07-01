/**
 * Remodel team data. Change types structure
 * @param {*} team 
 */
exports.remodelTeamData = (team) => {
  // Empty types object
  const newTypes = {};

  // Create member array
  team.members.forEach((member) => {
    newTypes[member.id_user] = {};
  });

  // Add types to members if member exist
  team.types.forEach((type) => {
    if (newTypes[type.id_user]) {
      newTypes[type.id_user][type.id_game] = type;
    }
  });

  // Remove useless data from team object
  delete team.types;

  // Add new types to team object
  team.types = newTypes;

  return team;
}

/**
 * Sort games 
 * @param {*} team 
 */
exports.sortGames = (team) => {
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

/**
 * Take out types from games to new array
 * @param {*} rawGames 
 */
exports.takeOutTypes = (rawGames) => {
  let games = [];
  let types = [];
  rawGames.forEach(game => {
    const plainGame = game.get({ plain: true });
    types = types.concat(plainGame.types);    
    games.push({ ...plainGame, types: null });
  });
  return { games, types };
}