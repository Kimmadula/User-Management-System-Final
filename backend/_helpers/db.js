const config = require("../config.json")
const mysql = require("mysql2/promise")
const { Sequelize } = require("sequelize")
const path = require("path")
const fs = require("fs")

const db = {}

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

    // 3. Load models - with path resolution to fix deployment issues
    const modelsPath = path.join(__dirname, "..", "models")
    console.log("Looking for models in:", modelsPath)

    if (fs.existsSync(modelsPath)) {
      console.log("Models directory exists")
      const userModelPath = path.join(modelsPath, "user.model.js")

      if (fs.existsSync(userModelPath)) {
        console.log("User model file exists at:", userModelPath)
        db.User = require(userModelPath)(sequelize, Sequelize.DataTypes)
      } else {
        console.log("User model file not found at:", userModelPath)
        // Define model inline as fallback
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
      }
    } else {
      console.log("Models directory does not exist")
      // Define model inline as fallback
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
    }

    // 4. Sync all models
    await sequelize.sync({ alter: true })
    console.log("Database synced")

    db.sequelize = sequelize
    db.Sequelize = Sequelize
  } catch (err) {
    console.error("Database init failed:", err)
    console.error("Error details:", err.message)
    console.error("Error stack:", err.stack)
    process.exit(1)
  }
}
