const config = require("../config.json")
const mysql = require("mysql2/promise")
const { Sequelize } = require("sequelize")

const db = {}
module.exports = db

initialize()

async function initialize() {
  try {
    const { host, port, user, password, database } = config.database

    // 1. Create DB if missing
    const adminConn = await mysql.createConnection({ host, port, user, password })
    await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`)
    await adminConn.end()

    // 2. Initialize Sequelize
    const sequelize = new Sequelize(database, user, password, {
      host,
      port,
      dialect: "mysql",
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: false,
        freezeTableName: true,
      },
    })

    // 3. Define User model directly in db.js
    db.User = sequelize.define("User", {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      passwordHash: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        defaultValue: "User",
      },
    })

    // 4. Sync all models
    await sequelize.sync({ alter: true })
    console.log("Database synced successfully")

    db.sequelize = sequelize
    db.Sequelize = Sequelize
  } catch (err) {
    console.error("Database init failed:", err)
    console.error("Error details:", err.message)
    console.error("Error stack:", err.stack)
    process.exit(1)
  }
}
