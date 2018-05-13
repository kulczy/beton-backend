module.exports = (sequelize, DataTypes) => {
  return sequelize.define('game', {
    _id_game: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
    close_at: { type: DataTypes.DATE, validate: { notEmpty: true } },
    id_team: { type: DataTypes.INTEGER, validate: { notEmpty: true } },
    player_a: { type: DataTypes.STRING, validate: { notEmpty: true } },
    player_b: { type: DataTypes.STRING, validate: { notEmpty: true } },
    score_a: { type: DataTypes.INTEGER },
    score_b: { type: DataTypes.INTEGER }
  });
};
