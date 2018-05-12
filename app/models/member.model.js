module.exports = (sequelize, DataTypes) => {
  return sequelize.define('member', {
    _id_member: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
    id_team: { type: DataTypes.INTEGER, validate: { notEmpty: true } },
    id_user: { type: DataTypes.INTEGER, validate: { notEmpty: true } },
    is_member: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_admin: { type: DataTypes.INTEGER, defaultValue: 0 }
  });
};
