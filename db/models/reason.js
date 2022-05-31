const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Reason = sequelize.define('Reason', {
    reason_id: {
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
    reason: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },{
    underscored: true
  });

  Reason.associate = models => {
    // models.Reason.belongsTo(models.Prediction);
    models.Reason.belongsTo(models.Prediction, { foreignKey: "prediction_id" })
  };

  return Reason;
}