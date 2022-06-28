const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CommentVote = sequelize.define('CommentVote', {
    comment_vote_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    comment_id: {
      type: DataTypes.INTEGER,
      references: {
        model: sequelize.models.Comment,
        key: 'comment_id'
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
    likes: {
      type: DataTypes.BOOLEAN
    },
    dislikes: {
      type: DataTypes.BOOLEAN
    }
  },{
    tableName: "comment_votes",
    underscored: true
  });

  CommentVote.associate = models => {
    models.CommentVote.belongsTo(models.Comment, { foreignKey: "comment_id" });
    models.CommentVote.belongsTo(models.Account, { foreignKey: "user_id" });
  };

  return CommentVote;
}