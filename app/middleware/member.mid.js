const memberCtrl = require('../controllers/member.controller');

/**
 * Add new member
 */
exports.memberInsert = async (req, res) => {
  try {
    const newMember = await memberCtrl.insertMember(req.body);
    res.status(200).send(newMember);
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Update member
 */
exports.memberUpdate = async (req, res) => {
  try {
    const member = await memberCtrl.updateMemberStatus(
      req.params._id_member,
      req.body
    );
    res.status(200).send({ resp: member });
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Delete membership
 */
exports.memberDelete = async (req, res) => {
  try {
    const member = await memberCtrl.deleteMember(req.params._id_member);
    res.status(200).send({ resp: member });
  } catch (err) {
    res.status(400).send(err);
  }
};
