const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require("./../config/dbConf");

const Feedback = sequelize.define('Feedback', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});



module.exports = Feedback;