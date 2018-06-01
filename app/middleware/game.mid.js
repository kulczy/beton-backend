const gameCtrl = require('../controllers/game.controller');

/**
 * Add new game
 */
exports.gameInsert = async (req, res) => {
  try {
    const newGame = await gameCtrl.insertGame({
      ...req.body,
      creator_id: req.auth._id_user
    });

    // Socket: emit to team
    req.ioTeam.in(`ioTeam_${req.body.id_team}`).emit('gameAdded', newGame);

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

    // Socket: emit to team
    req.ioTeam
      .in(`ioTeam_${req.body.id_team}`)
      .emit('gameUpdated', {
        ...req.body,
        _id_game: Number(req.params._id_game)
      });

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
    const game = await gameCtrl.deleteGame(
      req.params._id_game,
      req.query.id_team
    );

    // Socket: emit to team
    req.ioTeam
      .in(`ioTeam_${req.query.id_team}`)
      .emit('gameDeleted', { id_game: req.params._id_game });

    res.status(200).send({ resp: game });
  } catch (err) {
    res.status(400).send(err);
  }
};
