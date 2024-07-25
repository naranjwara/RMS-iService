const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('iService', 'postgres', '01012015', {
    host: "127.0.0.1",
    dialect: "postgres",
    logging: (msg) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(msg); 
        }
    }
});

module.exports = sequelize;