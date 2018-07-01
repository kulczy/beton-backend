const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const models = require('../models');
const { Game, Type } = models;

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

/**
 * Get game by ID
 * @param {int} _id_game 
 */
exports.getGame = async (_id_game) => {
  return await Game.findOne({
    where: { _id_game }
  });
};

/**
 * Get games with types
 * @param {int} id_team 
 * @param {array} exclude 
 * @param {int} limit 
 */
exports.getGamesWithTypes = async (id_team, exclude = [], limit = 10) => {
  return await Game.findAll({
    where: { id_team, _id_game: { [Op.notIn]: exclude } },
    order: [['close_at', 'DESC']],
    limit,
    include: [{ model: Type }], 
  });
};