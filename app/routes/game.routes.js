const gameCtrl = require('../controllers/game.controller');

/**
 * Add new game
 */
exports.gameInsert = async (req, res) => {
  try {
    const newGame = await gameCtrl.insertGame(req.body);
    res.status(200).send(newGame);
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Update game data
 */
exports.gameUpdate = async (req, res) => {
  try {
    const game = await gameCtrl.updateGame(req.params._id_game, req.body);
    res.status(200).send({ resp: game });
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * Delete game
 */
exports.gameDelete = async (req, res) => {
  try {
    const game = await gameCtrl.deleteGame(req.params._id_game);
    res.status(200).send({ resp: game });
  } catch (err) {
    res.status(400).send(err);
  }
};
