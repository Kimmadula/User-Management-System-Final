const config = require('../config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    try {
        const { host, port, user, password, database } = config.database;

        // 1. Create DB if missing
        const adminConn = await mysql.createConnection({ host, port, user, password });
        await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        await adminConn.end();

        // 2. Initialize Sequelize
        const sequelize = new Sequelize(database, user, password, {
            host,
            port,
            dialect: 'mysql',
            logging: false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            define: {
                timestamps: false,
                freezeTableName: true
            }
        });

        // 3. Load models
        db.User = require('../models/user.model')(sequelize, Sequelize.DataTypes);
        
        // 4. Sync all models
        await sequelize.sync({ alter: true });
        console.log('Database synced');

        db.sequelize = sequelize;
        db.Sequelize = Sequelize;

    } catch (err) {
        console.error('Database init failed:', err);
        process.exit(1);
    }
}