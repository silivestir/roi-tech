/*
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
}*/module.exports = {
    development: {
        username: 'bgckrxlt',   // Username from URL
        password: 'OQ2TG25MyY8LMSy-NXsSaY4pLGNxXmTy',  // Password from URL
        database: 'bgckrxlt',   // Database name from URL
        host: 'salt.db.elephantsql.com',  // Host from URL
        port: 5432,  // Port from URL (Postgres default is 5432)
        ssl: {
            rejectUnauthorized: false,  // allows the connection with SSL required
        }
    }
}
