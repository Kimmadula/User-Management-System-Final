const config = require('../config.json');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    try {
        const { host, port, user, password, database } = config.database;

        // 1. Initialize Sequelize for PostgreSQL
        const sequelize = new Sequelize(database, user, password, {
            host,
            port,
            dialect: 'postgres', // <-- change this from 'mysql' to 'postgres'
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

        // 2. Load models
        db.User = require('../models/user.model')(sequelize, Sequelize.DataTypes);

        // 3. Sync all models
        await sequelize.sync({ alter: true });
        console.log('Database synced');

        db.sequelize = sequelize;
        db.Sequelize = Sequelize;

    } catch (err) {
        console.error('Database init failed:', err);
        process.exit(1);
    }
}