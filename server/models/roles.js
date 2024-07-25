const { DataTypes } = require('sequelize');
const sequelize = require('../config/iService');

const roles = sequelize.define('roles', {
    role_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    role_name: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    descriptions: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'roles',
    timestamps: false,
  });
  

module.exports = roles;