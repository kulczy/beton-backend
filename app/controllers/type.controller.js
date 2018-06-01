const models = require('../models');
const { Type } = models;

/**
 * Get type by ID
 * @param {number} _id_type 
 */
exports.getType = async (_id_type) => {
  return await Type.findOne({
    where: { _id_type }
  });
};

/**
 * Add new type
 * @param {object} typeData object contains all type data:
 * id_team, id_game, id_user, type_a, type_b
 */
exports.insertType = async (typeData) => {
  const newType = await Type.build(typeData);
  return newType.save();
};

/**
 * Update type data
 * @param {int} _id_type
 * @param {object} typeData object contains some update data:
 * id_team, id_game, id_user, type_a, type_b
 */
exports.updateType = async (_id_type, typeData) => {
  return await Type.update(typeData, { where: { _id_type } });
};

/**
 * Delete type
 * @param {int} _id_type
 */
exports.deleteType = async (_id_type) => {
  return await Type.destroy({
    where: { _id_type }
  });
};
