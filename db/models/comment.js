const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Comment = sequelize.define('Comment', {
    comment_id: {
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
    username: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false
    },
    super_parent_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    parent_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    child_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    child_value: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    dislikes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },{
    underscored: true
  });

Comment.associate = models => {
    models.Comment.belongsTo(models.Prediction, { foreignKey: "prediction_id" });
    models.Comment.belongsTo(models.Account, { foreignKey: "user_id" });
    models.Comment.hasOne(models.CommentVote, { foreignKey: "comment_id" });
  };

  return Comment;
}