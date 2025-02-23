const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require("./../config/dbConf");

const Enrollment = sequelize.define('Enrollment', {

    userId: {
        type: DataTypes.UUID,

        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        }
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Courses',
            key: 'id',
        }
    },
    paymentStatus: {
        type: DataTypes.ENUM('Pending', 'Verified', 'Failed'),
        defaultValue: 'Pending',
    },
    paymentToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    enrollmentDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

Enrollment.associate = function(models) {
    // Define associations here if needed
    Enrollment.belongsTo(models.User, { foreignKey: 'userId' });
    Enrollment.belongsTo(models.Course, { foreignKey: 'courseId' });
};

module.exports = Enrollment;