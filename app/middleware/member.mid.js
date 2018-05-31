const memberCtrl = require('../controllers/member.controller');
const userCtrl = require('../controllers/user.controller');

/**
 * Add new member
 * 1. Check if user exist by email
 * 2. If user exist, check if 'is_public' column is true
 * 3. Check if member with given team and user ID's already exist
 */
exports.memberInsert = async (req, res) => {
  try {
    let member = [];
    const user = await userCtrl.getPublicUserByEmail(req.body.email);
    if (user) {
      member = await memberCtrl.findOrCreateMember(
        user._id_user,
        req.body.id_team,
        req.body.inviting_id
      );
    }

    let msg = {};
    if (!member.length) {
      msg.msg = 'No user found';
    }
    if (member.length && !member[1]) {
      msg.msg = 'The user is already member of the team';
      msg.member = member[0];
    }
    if (member.length && member[1]) {
      msg.msg = 'The user has been added';
      msg.member = member[0];

      // Socket: emit to member who was invite to the team and to the team
      const newMember = await memberCtrl.getUserMembershipsWithTeamData(
        member[0].id_user,
        0,
        1,
        null,
        member[0]._id_member
      );
      const newMemberWithUserData = await memberCtrl.getMemberWithUserData(
        member[0]._id_member
      );
      req.ioMember
        .in(`ioMember_${user._id_user}`)
        .emit('memberAdded', newMember.rows[0]);
      req.ioTeam
        .in(`ioTeam_${newMember.rows[0].id_team}`)
        .emit('memberAdded', newMemberWithUserData);
    }

    res.status(200).send(msg);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

/**
 * Update member
 */
exports.memberUpdate = async (req, res) => {
  try {
    if ('join_at' in req.body && req.body.join_at == 1) {
      req.body.join_at = new Date();
    }
    const member = await memberCtrl.updateMemberStatus(
      req.params._id_member,
      req.body
    );
    // Get new upadted member data
    const newMember = await memberCtrl.findMember(req.params._id_member);

    // Sockets:
    req.ioMember
      .in(`ioMember_${newMember.id_user}`)
      .emit('memberUpdated', newMember);
    req.ioTeam
      .in(`ioTeam_${newMember.id_team}`)
      .emit('memberUpdated', newMember);

    res.status(200).send({ resp: newMember });
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Delete membership
 */
exports.memberDelete = async (req, res) => {
  try {
    const member = await memberCtrl.deleteMember(
      req.query.id_user,
      req.query.id_team
    );
    // Socket: emit to team
    req.ioTeam
      .in(`ioTeam_${req.query.id_team}`)
      .emit('memberDelete', { id_user: req.query.id_user });

    // Socket: emit to user who memberships delete
    req.ioMember
      .in(`ioMember_${req.query.id_user}`)
      .emit('memberDelete', { id_team: req.query.id_team });

    res.status(200).send({ resp: member });
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Get all user memberships
 */
exports.membershipGet = async (req, res) => {
  try {
    const member = await memberCtrl.getUserMemberships(req.params._id_user);
    res.status(200).send({ resp: member });
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Get all user memberships with team data
 */
exports.membershipGetFull = async (req, res) => {
  try {
    const member = await memberCtrl.getUserMembershipsWithTeamData(
      req.params._id_user,
      req.query.is_member,
      req.query.limit,
      req.query.offset
    );
    res.status(200).send({ resp: member.rows, count: member.count });
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Count all user creator memberships
 */
exports.membershipCreatorCount = async (req, res) => {
  try {
    const member = await memberCtrl.getUserMemberships(
      req.params._id_user,
      null,
      true
    );
    const canCreate = member.length < 6 ? true : false;
    res.status(200).send({ resp: canCreate });
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Check if user is member or admin
 * by team URL or ID
 */
const memberStatus = async (req, res, next, data, goNext = true) => {
  try {
    const questionValue = data.questionValue ? data.questionValue : '1';
    const result = await memberCtrl.getMembershipStatus(
      data.id_user,
      data.queryTeamBy,
      data.gueryTeamValue,
      data.question,
      questionValue
    );
    if (result.is) {
      if (goNext) next();
      else res.status(200).send(result);
    } else {
      res.status(403).send('you do not have permission');
    }
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.is = {
  // Get is_member status by ID
  memberByID: (req, res, next) => {
    memberStatus(req, res, next, {
      id_user: req.auth._id_user,
      queryTeamBy: '_id_team',
      gueryTeamValue:
        req.params._id_team || req.body.id_team || req.query.id_team,
      question: 'is_member'
    });
  },

  // Get is_member status by ID
  memberAnyByID: (req, res, next) => {
    memberStatus(req, res, next, {
      id_user: req.auth._id_user,
      queryTeamBy: '_id_team',
      gueryTeamValue:
        req.params._id_team || req.body.id_team || req.query.id_team,
      question: 'is_member',
      questionValue: '0, 1'
    });
  },

  // Get is_member status by URL
  memberByURL: (req, res, next) => {
    memberStatus(req, res, next, {
      id_user: req.auth._id_user,
      queryTeamBy: 'url',
      gueryTeamValue: req.params.url,
      question: 'is_member'
    });
  },

  // Get is_admin status by ID
  adminByID: (req, res, next) => {
    memberStatus(req, res, next, {
      id_user: req.auth._id_user,
      queryTeamBy: '_id_team',
      gueryTeamValue: req.params._id_team || req.body.id_team,
      question: 'is_admin'
    });
  },

  // Get is_admin status by URL
  adminByURL: (req, res, next) => {
    memberStatus(req, res, next, {
      id_user: req.auth._id_user,
      queryTeamBy: 'url',
      gueryTeamValue: req.params.url,
      question: 'is_admin'
    });
  },

  // Get is_creator status by ID
  creatorByID: (req, res, next) => {
    memberStatus(req, res, next, {
      id_user: req.auth._id_user,
      queryTeamBy: '_id_team',
      gueryTeamValue: req.params._id_team || req.body.id_team,
      question: 'is_creator'
    });
  },

  // Get is_creator status by URL
  creatorByURL: (req, res, next) => {
    memberStatus(req, res, next, {
      id_user: req.auth._id_user,
      queryTeamBy: 'url',
      gueryTeamValue: req.params.url,
      question: 'is_creator'
    });
  },

  // Return object instead go next() in express middleware
  membership: (req, res, next) => {
    memberStatus(
      req,
      res,
      next,
      {
        id_user: req.query.id_user,
        queryTeamBy: req.query.queryTeamBy,
        gueryTeamValue: req.query.gueryTeamValue,
        question: req.query.question
      },
      0
    );
  }
};
