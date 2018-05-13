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

/**
 * Check if user is member or admin
 * by team URL or ID
 */
const memberStatus = async (req, res, next, data, goNext = true) => {
  try {
    const result = await memberCtrl.getMembershipStatus(
      data.id_user,
      data.queryTeamBy,
      data.gueryTeamValue,
      data.question
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
      gueryTeamValue: req.params._id_team || req.body.id_team,
      question: 'is_member'
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
        id_user: req.body.id_user,
        queryTeamBy: req.body.queryTeamBy,
        gueryTeamValue: req.body.gueryTeamValue,
        question: req.body.question
      },
      0
    );
  }
};
