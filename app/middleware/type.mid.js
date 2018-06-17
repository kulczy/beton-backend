const typeCtrl = require('../controllers/type.controller');
const gameCtrl = require('../controllers/game.controller');

/**
 * Add new type
 */
exports.typeInsert = async (req, res) => {
  try {    
    // Throw error if game is close
    if (await isGameClosed(req.body.id_game)) throw 'Game is closed';
    
    const newType = await typeCtrl.insertType({
      ...req.body,
      id_user: req.auth._id_user
    });

    // Socket: emit to team
    req.ioTeam.in(`ioTeam_${newType.id_team}`).emit('typeChanged', newType);

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
    // Throw error if game is close
    if (await isGameClosed(req.body.id_game)) throw 'Game is closed';

    const type = await typeCtrl.updateType(req.params._id_type, req.body);
    const freshType = await typeCtrl.getType(req.params._id_type);

    // Socket: emit to team
    req.ioTeam.in(`ioTeam_${freshType.id_team}`).emit('typeChanged', freshType);

    res.status(200).send({ resp: type, freshType });
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

/**
 * Check if game is closed
 */
const isGameClosed = async (gameID) => {
  const game = await gameCtrl.getGame(gameID);
  const isClose = new Date(game.close_at).getTime() < new Date().getTime() ? true : false;
  return isClose;
}
