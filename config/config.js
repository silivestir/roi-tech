require("dotenv").config()

module.exports = {
    development: {
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'admin',
        database: process.env.DB_NAME || 'postgres',
        host: process.env.DB_HOST || '127.0.0.0',
        port: process.env.DB_PORT || 5432,
        ssl: {
            rejectUnauthorized: false, // allows the connection with SSL required
        }
    }
}