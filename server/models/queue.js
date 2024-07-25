const { DataTypes } = require('sequelize');
const sequelize = require('../config/iService'); 

const Queue = sequelize.define('queue', {
  queue: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  technician_desk: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('waiting', 'in-progress', 'complete'),
    allowNull: false,
    defaultValue: 'waiting',
  },
}, {
  timestamps: true,
});

module.exports = Queue;
