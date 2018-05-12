const models = require('../models');
const { Member } = models;

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
