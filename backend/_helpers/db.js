const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs'); 

module.exports = db = {};

console.log('Env variables:', {
  MYSQL_HOST: process.env.MYSQL_HOST,
  MYSQL_PORT: process.env.MYSQL_PORT,
  MYSQL_USER: process.env.MYSQL_USER,
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD ? '***' : null,
  MYSQL_DATABASE: process.env.MYSQL_DATABASE
});

initialize();

async function initialize() {
    try {
        const host = process.env.MYSQL_HOST || 'gondola.proxy.rlwy.net';
        const port = process.env.MYSQL_PORT || 58293;
        const user = process.env.MYSQL_USER || 'root';
        const password = process.env.MYSQL_PASSWORD || 'qnrzhqBAsdQmMkQBOjZBuOXGBQWIJVJm';
        const database = process.env.MYSQL_DATABASE || 'railway';

        console.log(`Connecting to database: ${database} on ${host}:${port}`);

        // create db if it doesn't already exist
        const connection = await mysql.createConnection({ host, port, user, password });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        console.log(`Database '${database}' exists or was created`);

        // connect to db with Sequelize
        const sequelize = new Sequelize(database, user, password, { 
            host, 
            port, 
            dialect: 'mysql',
            logging: console.log,
            define: {
                timestamps: false
            }
        });

        // init models
        db.Account = require('../accounts/account.model')(sequelize);
        db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
        db.Department = require('../departments/department.model')(sequelize);
        db.Employee = require('../employees/employee.model')(sequelize);
        db.Workflow = require('../workflows/workflow.model')(sequelize);
        db.Request = require('../requests/request.model')(sequelize);
        db.RequestItem = require('../requests/request-item.model')(sequelize);

        // relationships
        db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
        db.RefreshToken.belongsTo(db.Account);

        db.Department.hasMany(db.Employee, { foreignKey: 'departmentId', onDelete: 'SET NULL' });
        db.Employee.belongsTo(db.Department, { foreignKey: 'departmentId' });

        db.Account.hasOne(db.Employee, { foreignKey: 'userId', onDelete: 'CASCADE' });
        db.Employee.belongsTo(db.Account, { foreignKey: 'userId' });

        db.Employee.hasMany(db.Workflow, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
        db.Workflow.belongsTo(db.Employee, { foreignKey: 'employeeId' });

        db.Employee.hasMany(db.Request, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
        db.Request.belongsTo(db.Employee, { foreignKey: 'employeeId' });

        db.Request.hasMany(db.RequestItem, { foreignKey: 'requestId', onDelete: 'CASCADE' });
        db.RequestItem.belongsTo(db.Request, { foreignKey: 'requestId' });

        db.Account.hasMany(db.Request, {
            foreignKey: 'approverId',
            as: 'ApprovedRequests',
            onDelete: 'SET NULL'
        });
        db.Request.belongsTo(db.Account, {
            foreignKey: 'approverId',
            as: 'Approver'
        });

        // sync
        console.log('Syncing models with database...');
        await sequelize.sync({ alter: true });
        console.log('Database sync complete');

        // ✅ Insert default admin account if not exists
        const [rows] = await sequelize.query(
            `SELECT COUNT(*) AS count FROM accounts WHERE email = 'admin@example.com'`
        );

        if (rows[0].count === 0) {
            const plainPassword = '1234567';
            const passwordHash = await bcrypt.hash(plainPassword, 10);

            await sequelize.query(`
                INSERT INTO accounts (
                    email, passwordHash, title, firstName, lastName,
                    acceptTerms, role, created, isActive
                ) VALUES (
                    'admin@example.com',
                    '${passwordHash}',
                    'Mr',
                    'Iris',
                    'Tumakay',
                    true,
                    'Admin',
                    NOW(),
                    true
                )
            `);

            console.log(' Default admin account inserted.');
        } else {
            console.log(' Admin account already exists.');
        }
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
}
