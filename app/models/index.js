const sequelize = require('../db');

// Import models
const Team = sequelize.import('./team.model');
const Game = sequelize.import('./game.model');
const Type = sequelize.import('./type.model');
const Member = sequelize.import('./member.model');
const User = sequelize.import('./user.model');

// Models associations for select team with all info
Team.hasMany(Member, { foreignKey: 'id_team' });
Member.belongsTo(User, { foreignKey: 'id_user' });
Team.hasMany(Game, { foreignKey: 'id_team' });
Game.hasMany(Type, { foreignKey: 'id_game' });
Team.hasMany(Type, { foreignKey: 'id_team' });

// Models associations - connect team data to member
Member.belongsTo(Team, { foreignKey: 'id_team' });
// Models associations - connect user data to inviting member
Member.belongsTo(User, { foreignKey: 'inviting_id', as: 'inviting_data' });

// Models association for select user with all team data
// User.hasMany(Member, { foreignKey: 'id_user' });
// Member.belongsTo(Team, { foreignKey: 'id_team' });

// Export models
exports.Team = Team;
exports.Game = Game;
exports.Type = Type;
exports.Member = Member;
exports.User = User;
exports.sequelizeInstance = sequelize;
