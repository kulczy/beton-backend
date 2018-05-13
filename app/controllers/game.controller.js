const models = require('../models');
const { Game } = models;

/**
 * Add new game
 * @param {object} gameData object contains all game data:
 * creator_id, close_at, id_team, player_a, player_b, score_a, score_b
 */
exports.insertGame = async (gameData) => {
  const newGame = await Game.build(gameData);
  return newGame.save();
};

/**
 * Update game data
 * @param {int} _id_game
 * @param {object} gameData object contains some update data:
 * creator_id, close_at, id_team, player_a, player_b, score_a, score_b
 */
exports.updateGame = async (_id_game, gameData) => {
  return await Game.update(gameData, {
    where: {
      _id_game,
      id_team: gameData.id_team
    }
  });
};

/**
 * Delete game
 * @param {int} _id_game
 * @param {int} id_team
 */
exports.deleteGame = async (_id_game, id_team) => {
  return await Game.destroy({
    where: { _id_game, id_team }
  });
};
