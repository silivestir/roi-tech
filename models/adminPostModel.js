const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require("./../config/dbConf");
const User = require('./../models/userModel');

// Define the UserPosts model
const AdminPost = sequelize.define('AdminPost', {
    // Define the foreign key as UUID
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Automatically generate UUIDs
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id', // Assuming 'id' is UUID in the User model
        },
        onDelete: 'CASCADE',
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    posttitle: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    posttype: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    like: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: false,
    },
    username: {
        type: DataTypes.TEXT,
    },
    price: {
        type: DataTypes.TEXT,
    },
    from: {
        type: DataTypes.TEXT,
    },
    to: {

        type: DataTypes.TEXT,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
}, {
    timestamps: true,
});

// Setting up associations
User.hasMany(AdminPost, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
});
AdminPost.belongsTo(User, {
    foreignKey: 'userId',
});

// Sync the model



module.exports = AdminPost;