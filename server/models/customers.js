const { DataTypes, UUIDV1 } = require('sequelize');
const { v4: uuidv4 } = require('uuid'); // Menggunakan UUID v4
const sequelize = require('../config/iService');

const customers = sequelize.define('customers', {
    customer_id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4, 
        primaryKey: true
    },
    full_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    surname: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    phone_number: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    nik: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    timestamps: false // Menonaktifkan timestamps jika tidak diperlukan
});

module.exports = customers;