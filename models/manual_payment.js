"use strict";
import { Model } from "sequelize";
module.exports = (sequelize, DataTypes) => {
  class ManualPayment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ManualPayment.belongsTo(models.User, {
        foreignKey: "user_id",
      });

      ManualPayment.belongsTo(models.Package, {
        foreignKey: "package_id",
      });

      ManualPayment.belongsTo(models.User, {
        foreignKey: "approved_by",
        as: "ApproveBy",
      });
    }
  }
  ManualPayment.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      package_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "packages",
          key: "id",
        },
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      payment_slip: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payment_slip_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        default: DataTypes.CURRENT_TIMESTAMP,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        default: DataTypes.CURRENT_TIMESTAMP,
      },
    },
    {
      sequelize,
      modelName: "ManualPayment",
      tableName: "manual_payments",
    },
  );
  return ManualPayment;
};
