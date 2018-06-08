module.exports = (sequelize, DataTypes) => {
  return sequelize.define('team', {
    _id_team: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },    
    url: {
      type: DataTypes.UUID,
      unique: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      validate: { notEmpty: true, len: [3, 40] }
    }
  });
};
