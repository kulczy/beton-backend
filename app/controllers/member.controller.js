const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const models = require('../models');
const { Member, Team, User } = models;

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
 * Find single member by ID
 * @param {number} _id_member 
 */
exports.findMember = async (_id_member) => {
  return await Member.findOne({
    where: { _id_member }
  });
}

/**
 * Find member or create if not exist
 * @param {int} id_user
 * @param {int} id_team
 */
exports.findOrCreateMember = async (id_user, id_team, inviting_id) => {
  return await Member.findOrCreate({
    where: { id_user, id_team },
    defaults: { id_user, id_team, inviting_id }
  });
};

/**
 * Update member status
 * 0 is not member, 1 is member
 * @param {int} _id_member id of membership
 * @param {object} memberData object contains all member data:
 * id_team, id_user, is_member, is_admin
 * Prevent if user is creator
 */
exports.updateMemberStatus = async (_id_member, memberData) => {
  return await Member.update(memberData, {
    where: { _id_member }
  });
};

/**
 * Delete membership
 * @param {int} id_user
 * @param {int} id_team
 * Prevent if user is creator
 */
exports.deleteMember = async (id_user, id_team) => {
  return await Member.destroy({
    where: { id_user, id_team }
  });
};

/**
 * Get all user memberships
 * @param {int} id_user
 * @param {boolean} is_admin if true, query only membership
 * where user is admin
 * @param {boolean} is_creator if true, query only membership
 * where user is creator
 */
exports.getUserMemberships = async (
  id_user,
  is_admin = null,
  is_creator = null
) => {
  const query = { where: { id_user } };
  if (is_admin) query.where.is_admin = 1;
  if (is_creator) query.where.is_creator = 1;
  return await Member.findAll(query);
};

/**
 * Get member with user data by member ID
 * @param {number} _id_member 
 */
exports.getMemberWithUserData = async (_id_member) => {
  const query = { where: { _id_member } };
  query.include = [{ model: User }];
  return await Member.findOne(query);
};

/**
 * Get all user memberships with team data
 * query by id_user and if is member or not
 * @param {int} id_user
 * @param {string} is_member
 */
exports.getUserMembershipsWithTeamData = async (
  id_user,
  is_member,
  limit,
  offset,
  _id_member
) => {
  const query = {
    where: { id_user, is_member: { [Op.or]: [0, 1] } },
    include: [{ model: Team }, { model: User, as: 'inviting_data' }],
    order: [['join_at', 'DESC'], ['updated_at', 'DESC']]
  };

  if (is_member) query.where.is_member = [Number(is_member)];
  if (limit) query.limit = Number(limit);
  if (offset) query.offset = Number(offset);
  if (_id_member) query.where._id_member = [Number(_id_member)];

  return await Member.findAndCountAll(query);
};

/**
 * Check if user is team member or admin
 * query team by ID or URL
 * @param {int} id_user id of the user who wants the access
 * @param {string} queryTeamBy query key,ID or URL
 * @param {string|int} gueryTeamValue value for key
 * @param {string} question what status function shoud check
 * @param {string} questionValue 0 or 1
 *
 */
exports.getMembershipStatus = async (
  id_user,
  queryTeamBy,
  gueryTeamValue,
  question,
  questionValue
) => {
  const result = await models.sequelizeInstance.query(
    `SELECT member.is_member 
     FROM team INNER JOIN member ON team._id_team = member.id_team 
     WHERE member.id_user = ${id_user} 
     AND team.${queryTeamBy} = "${gueryTeamValue}" 
     AND member.${question} IN (${questionValue})`,
    { type: models.sequelizeInstance.QueryTypes.SELECT }
  );
  return result.length ? { is: 1 } : { is: 0 };
};
