const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Source = sequelize.define('Source', {
    source_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    reason_id: {
      type: DataTypes.INTEGER,
      references: {
        model: sequelize.models.Reason,
        key: 'reason_id'
      },
      allowNull: false
    },
    source_type: {
      type: DataTypes.STRING(24),
      allowNull: true
    },
    author1_last: {
      type: DataTypes.STRING(264),
      allowNull: true
    },
    author1_initial: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    author1_first: {
      type: DataTypes.STRING(264),
      allowNull: true
    },
    author2_last: {
      type: DataTypes.STRING(264),
      allowNull: true
    },
    author2_initial: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    author2_first: {
      type: DataTypes.STRING(264),
      allowNull: true
    },
    et_al: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    database_name: {
      type: DataTypes.STRING(264),
      allowNull: true
    },
    publication_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    accessed_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING(400),
      allowNull: true
    },
    edition: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    volume: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    issue: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    pages: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    publisher_name: {
      type: DataTypes.STRING(264),
      allowNull: true
    },
    uploader_name: {
      type: DataTypes.STRING(264),
      allowNull: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },{
    underscored: true
  });

  Source.associate = models => {
    models.Source.belongsTo(models.Reason, { foreignKey: "reason_id" })
  };

  return Source;
}