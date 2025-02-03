'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ranking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Ranking.belongsTo(models.User, {
        foreignKey: 'user_id'
      })
    }
  };
  Ranking.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    total_range: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
      allowNull: false
    },
    total_time: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
      allowNull: false
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      default: DataTypes.CURRENT_TIMESTAMP
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      default: DataTypes.CURRENT_TIMESTAMP
    },
  }, {
    sequelize,
    modelName: 'Ranking',
    tableName: 'rankings',
  });
  return Ranking;
};