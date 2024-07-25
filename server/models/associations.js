const users = require('./users');
const roles = require('./roles');

roles.hasMany(users, { foreignKey: 'role_id' });
users.belongsTo(roles, { foreignKey: 'role_id' });

module.exports = { users, roles };