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

/**
 * Check if user is team member
 * @param {int} id_user id of the user who wants the access
 * @param {string} url url of the team
 * @param {string} question what status function shoud check:
 * is_admin or is_member
 */
exports.getStatus = async (id_user, url, question) => {
  const status = (question === 'is_admin') ? 'is_admin' : 'is_member';
  const result = await models.sequelizeInstance.query(
    `SELECT member.is_member 
     FROM team 
     INNER JOIN member ON team._id_team = member.id_team 
     WHERE member.id_user = ${id_user} AND team.url = "${url}" AND member.${status} = 1`,
    { type: models.sequelizeInstance.QueryTypes.SELECT }
  );
  return result.length ? { [status]: 1 } : { [status]: 0 };
};
