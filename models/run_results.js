'use strict';
import {
  Model
} from 'sequelize';
module.exports = (sequelize, DataTypes) => {
  class RunResult extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RunResult.belongsTo(models.User, {
          onDelete: 'cascade',
          onUpdate: 'cascade',
          foreignKey: 'user_id'
        }),
        RunResult.belongsTo(models.User, {
          onDelete: 'cascade',
          onUpdate: 'cascade',
          foreignKey: 'approved_by',
          as: "ApproveBy"
        })
    }
  };
  RunResult.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    range: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    time: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approve', 'reject'),
      allowNull: false,
      defaultValue: 'pending'
    },
    reject_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image_id: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: 'RunResult',
    tableName: 'run_results'
  });
  return RunResult;
};