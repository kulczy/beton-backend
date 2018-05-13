const typeCtrl = require('../controllers/type.controller');

/**
 * Add new type
 */
exports.typeInsert = async (req, res) => {
  try {
    const newType = await typeCtrl.insertType({
      ...req.body,
      id_user: req.auth._id_user
    });
    res.status(200).send(newType);
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Update type
 */
exports.typeUpdate = async (req, res) => {
  try {
    const type = await typeCtrl.updateType(req.params._id_type, req.body);
    res.status(200).send({ resp: type });
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Delete type
 */
exports.typeDelete = async (req, res) => {
  try {
    const type = await typeCtrl.deleteType(req.params._id_type);
    res.status(200).send({ resp: type });
  } catch (err) {
    res.status(400).send(err);
  }
};