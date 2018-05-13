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
 * Select full team info by URL
 * with users, games and types
 * @param {string} url
 */
exports.getFullTeam = async (url) => {
  return await Team.findOne({
    where: { url },
    include: [
      {
        model: Member,
        include: [{ model: User }]
      },
      {
        model: Game,
        include: [{ model: Type }]
      }
    ]
  });
};

