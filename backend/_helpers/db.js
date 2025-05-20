const config = require("../config.json")
const mysql = require("mysql2/promise")
const { Sequelize } = require("sequelize")
const fs = require("fs")
const path = require("path")

const db = {} // Declare the db variable

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

    // 3. Load models with multiple fallback options
    try {
      // First attempt - try the original path
      console.log("Attempting to load user model from ../models/user.model")
      db.User = require("../models/user.model")(sequelize, Sequelize.DataTypes)
    } catch (modelError) {
      console.log("Failed to load from ../models/user.model, trying alternative paths...")

      try {
        // Second attempt - try with .js extension
        console.log("Attempting to load user model from ../models/user.model.js")
        db.User = require("../models/user.model.js")(sequelize, Sequelize.DataTypes)
      } catch (jsError) {
        try {
          // Third attempt - try _models directory
          console.log("Attempting to load user model from ../_models/user.model")
          db.User = require("../_models/user.model")(sequelize, Sequelize.DataTypes)
        } catch (underscoreError) {
          // Final fallback - define the model directly
          console.log("All import attempts failed. Defining user model directly in db.js")

          // Define a basic user model directly in this file as a last resort
          db.User = sequelize.define("User", {
            id: {
              type: Sequelize.DataTypes.INTEGER,
              autoIncrement: true,
              primaryKey: true,
            },
            firstName: { type: Sequelize.DataTypes.STRING, allowNull: false },
            lastName: { type: Sequelize.DataTypes.STRING, allowNull: false },
            username: { type: Sequelize.DataTypes.STRING, allowNull: false },
            email: { type: Sequelize.DataTypes.STRING, allowNull: false },
            passwordHash: { type: Sequelize.DataTypes.STRING, allowNull: false },
            role: { type: Sequelize.DataTypes.STRING, allowNull: false },
            verificationToken: { type: Sequelize.DataTypes.STRING },
            verified: { type: Sequelize.DataTypes.DATE },
            resetToken: { type: Sequelize.DataTypes.STRING },
            resetTokenExpires: { type: Sequelize.DataTypes.DATE },
            passwordReset: { type: Sequelize.DataTypes.DATE },
            created: {
              type: Sequelize.DataTypes.DATE,
              allowNull: false,
              defaultValue: Sequelize.DataTypes.NOW,
            },
            updated: {
              type: Sequelize.DataTypes.DATE,
              allowNull: false,
              defaultValue: Sequelize.DataTypes.NOW,
            },
          })
        }
      }
    }

    // 4. Sync all models
    await sequelize.sync({ alter: true })
    console.log("Database synced successfully")

    db.sequelize = sequelize
    db.Sequelize = Sequelize
  } catch (err) {
    console.error("Database init failed:", err)
    process.exit(1)
  }
}
