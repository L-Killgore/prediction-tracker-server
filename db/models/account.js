const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Account = sequelize.define('Account', {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false
    },
    prediction_score: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },{
    underscored: true
  });

  Account.associate = models => {
    models.Account.hasMany(models.Prediction, { foreignKey: "user_id" });
    models.Account.hasMany(models.Vote, { foreignKey: "user_id" });
  };

  return Account;
}