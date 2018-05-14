const models = require('../models');
const { Member, Team } = models;

/**
 * Add new member
 * @param {object} memberData object contains all member data:
 * id_team, id_user, is_member, is_admin
 */
exports.insertMember = async (memberData) => {
  const newMember = await Member.build(memberData);
  return newMember.save();
};

/**
 * Update member status
 * 0 is not member, 1 is member
 * @param {int} _id_member id of membership
 * @param {object} memberData object contains all member data:
 * id_team, id_user, is_member, is_admin
 */
exports.updateMemberStatus = async (_id_member, memberData) => {
  return await Member.update(memberData, { where: { _id_member } });
};

/**
 * Delete membership
 * @param {int} _id_member id of membership
 */
exports.deleteMember = async (_id_member) => {
  return await Member.destroy({
    where: { _id_member }
  });
};

/**
 * Get all user memberships
 * @param {int} id_user 
 */
exports.getUserMemberships = async (id_user) => {
  return await Member.findAll({
    where: { id_user }
  });
};

/**
 * Get all user memberships with team data
 * @param {int} id_user 
 */
exports.getUserMembershipsWithTeamData = async (id_user) => {
  return await Member.findAll({
    where: { id_user },
    include: [
      {
        model: Team
      }
    ]
  });
};

/**
 * Check if user is team member or admin
 * query team by ID or URL
 * @param {int} id_user id of the user who wants the access
 * @param {string} queryTeamBy query key,ID or URL
 * @param {string|int} gueryTeamValue value for key
 * @param {string} question what status function shoud check:
 * is_admin or is_member
 */
exports.getMembershipStatus = async (
  id_user,
  queryTeamBy,
  gueryTeamValue,
  question
) => {
  const result = await models.sequelizeInstance.query(
    `SELECT member.is_member 
     FROM team INNER JOIN member ON team._id_team = member.id_team 
     WHERE member.id_user = ${id_user} 
     AND team.${queryTeamBy} = "${gueryTeamValue}" 
     AND member.${question} = 1`,
    { type: models.sequelizeInstance.QueryTypes.SELECT }
  );
  return result.length ? { is: 1 } : { is: 0 };
};
