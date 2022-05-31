const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vote = sequelize.define('Vote', {
    vote_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    prediction_id: {
      type: DataTypes.INTEGER,
      references: {
        model: sequelize.models.Prediction,
        key: 'prediction_id'
      },
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: sequelize.models.Account,
        key: 'user_id'
      },
      allowNull: false
    },
    plausible: {
      type: DataTypes.BOOLEAN
    },
    correct: {
      type: DataTypes.BOOLEAN
    }
  },{
    underscored: true
  });

  Vote.associate = models => {
    // models.Vote.belongsTo(models.Prediction);
    // models.Vote.belongsTo(models.Account);
    models.Vote.belongsTo(models.Prediction, { foreignKey: "prediction_id" });
    models.Vote.belongsTo(models.Account, { foreignKey: "user_id" });
  };

  return Vote;
}