const teamCtrl = require('../controllers/team.controller');
const memberCtrl = require('../controllers/member.controller');

/**
 * Add new team
 */
exports.teamInsert = async (req, res) => {
  try {
    const newTeam = await teamCtrl.insertTeam(req.body);
    const newMember = await memberCtrl.insertMember({
      join_at: new Date(),
      id_team: newTeam._id_team,
      id_user: req.auth._id_user,
      is_member: 1,
      is_admin: 1,
      is_creator: 1
    });
    res.status(200).send({ newTeam, newMember });
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Update team
 */
exports.teamUpdate = async (req, res) => {
  try {
    const update = await teamCtrl.updateTeam(req.params._id_team, req.body);
    res.status(200).send({ resp: update });
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Delete team
 */
exports.teamDelete = async (req, res) => {
  try {
    const remove = await teamCtrl.deleteTeam(req.params._id_team);
    res.status(200).send({ resp: remove });
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Get basic team by ID
 */
exports.teamGet = async (req, res) => {
  try {
    const team = await teamCtrl.getTeam(req.params._id_team);
    res.status(200).send(team);
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Get full team data by URL
 */
exports.teamFullGet = async (req, res) => {
  try {
    const team = await teamCtrl.getFullTeam(req.params.url);
    res.status(200).send(team);
  } catch (err) {
    res.status(400).send(err);
  }
};


