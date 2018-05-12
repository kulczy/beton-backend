module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user', {
    _id_user: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
    facebook_id: { type: DataTypes.STRING, unique: true, validate: { notEmpty: true } },
    username: { type: DataTypes.STRING, validate: { notEmpty: true, len: [3,10] } },
    email: { type: DataTypes.STRING, unique: true, validate: { isEmail: true } },
    photo: { type: DataTypes.STRING },
    is_public: { type: DataTypes.INTEGER, defaultValue: 1 }
  });
};
