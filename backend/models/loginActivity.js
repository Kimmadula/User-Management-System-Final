// models/loginActivity.js

module.exports = (sequelize, DataTypes) => {
  const LoginActivity = sequelize.define('LoginActivity', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false },
    ipAddress: { type: DataTypes.STRING },
    userAgent: { type: DataTypes.STRING },
    loginTime: { type: DataTypes.DATE, allowNull: false }
  });

  LoginActivity.associate = function(models) {
    LoginActivity.belongsTo(models.Account, {
      foreignKey: 'accountId',
      as: 'account'
    });
  };

  return LoginActivity;
};
