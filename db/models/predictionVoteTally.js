const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PredictionVoteTally = sequelize.define('PredictionVoteTally', {
    tally_id: {
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
    plausible: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    implausible: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    correct: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    incorrect: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },{
    tableName: "prediction_vote_tallies",
    underscored: true
  });

  PredictionVoteTally.associate = models => {
    // models.PredictionVoteTally.belongsTo(models.Prediction);
    models.PredictionVoteTally.belongsTo(models.Prediction, { foreignKey: "prediction_id" });
  };

  return PredictionVoteTally;
}