module.exports = (sequelize, DataTypes) => {
  return sequelize.define('type', {
    _id_type: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
    id_team: { type: DataTypes.INTEGER, validate: { notEmpty: true } },
    id_game: { type: DataTypes.INTEGER, validate: { notEmpty: true } },
    id_user: { type: DataTypes.INTEGER, validate: { notEmpty: true } },
    type_a: { type: DataTypes.INTEGER, validate: { notEmpty: true } },
    type_b: { type: DataTypes.INTEGER, validate: { notEmpty: true } }
  });
};
