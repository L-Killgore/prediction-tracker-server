const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Prediction = sequelize.define('Prediction', {
    prediction_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: sequelize.models.Account,
        key: 'user_id'
      },
      allowNull: false
    },
    user_prediction_status: {
      type: DataTypes.STRING(7),
      allowNull: false
    },
    claim_title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    claim_major: {
      type: DataTypes.STRING(264),
      allowNull: false
    },
    post_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    timeframe: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    conc_reason: {
      type: DataTypes.STRING,
    },
    conc_reason_timestamp: {
      type: DataTypes.DATE,
    }
  },{
    underscored: true
  });

  Prediction.associate = models => {
    models.Prediction.belongsTo(models.Account, { foreignKey: "user_id" });
    models.Prediction.hasMany(models.Comment, { foreignKey: "prediction_id" });
    models.Prediction.hasMany(models.Reason, { foreignKey: "prediction_id" });
    models.Prediction.hasMany(models.Vote, { foreignKey: "prediction_id" });
    models.Prediction.hasOne(models.PredictionVoteTally, { foreignKey: "prediction_id" });

  };

  return Prediction;
}