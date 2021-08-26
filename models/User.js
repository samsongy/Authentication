const Sequelize = require('sequelize');
const sequelize = require('../database/connection');

module.exports = sequelize.define("User", {
    id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    firstName: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    userName: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    }
});