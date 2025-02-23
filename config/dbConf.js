const { Sequelize } = require("sequelize");
const config = require("./../config/config").development;
require("dotenv").config(); // Ensure the environment variables are loaded

// Initialize sequelize with environment variables
const sequelize = new Sequelize(config.username, config.database, config.password, {
    host: "127.0.0.1",
    port: config.port,
    dialect: 'postgres',
    logging: false, // Disabling Sequelize logging
});

// Test the connection (optional but recommended for debugging)
sequelize.authenticate()
    .then(() => console.log('Database connected successfully.'))
    .catch((err) => console.error('Database connection failed:', err));

module.exports = sequelize;