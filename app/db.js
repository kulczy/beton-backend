const Sequelize = require('sequelize');

module.exports = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    logging: process.env.SEQUALIZE_LOG ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
      charset: 'utf8',
      dialectOptions: { collate: 'utf8_general_ci' }
    }
  }
);