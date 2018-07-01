const models = require('../models');
const { Team, Game, Type, Member, User } = models;

/**
 * Add new team
 * @param {object} teamData object contains all team data:
 * name
 */
exports.insertTeam = async (teamData) => {
  const newTeam = await Team.build(teamData);
  return newTeam.save();
};

/**
 * Update team
 * @param {int} _id_team
 * @param {object} teamData object contains all team data:
 * name
 */
exports.updateTeam = async (_id_team, teamData) => {
  return await Team.update(teamData, { where: { _id_team } });
};

/**
 * Delete team
 * @param {int} _id_team
 */
exports.deleteTeam = async (_id_team) => {
  return await Team.destroy({
    where: { _id_team }
  });
};

/**
 * Select team by ID
 * @param {int} _id_team
 */
exports.getTeam = async (_id_team) => {
  return await Team.findOne({
    where: { _id_team }
  });
};

/**
 * Select team by URL
 * @param {int} url
 */
exports.getTeamByURL = async (url) => {
  return await Team.findOne({
    where: { url }
  });
};

/**
 * Select full team info by URL
 * with users, games and types
 * @param {string} url
 */
exports.getFullTeam = async (url) => {
  return await Team.findOne({
    where: { url },
    order: [
      [Game, 'close_at', 'DESC'],
      [Member, 'join_at', 'ASC']
    ],
    include: [
      {
        model: Type
      },
      {
        model: Member,
        include: [{ model: User }]
      },
      {
        model: Game,        
        // include: [{ model: Type }]    
      }
    ],    
  });
};

/**
 * Select team info with members by URL
 * @param {string} url
 */
exports.getTeamDataWithMembers = async (url, userData = true) => {
  const query = {
    where: { url },
    order: [
      [Member, 'join_at', 'ASC']
    ],
    include: [
      {
        model: Member,
        // include: [{ model: User }]
      }
    ],    
  };

  if (userData) {
    query.include[0].include = [{ model: User }];
  }

  return await Team.findOne(query);
};