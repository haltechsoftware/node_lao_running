"use strict";
import { Model } from "sequelize";

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Role.belongsToMany(models.User, {
        through: models.RoleUser,
        foreignKey: "role_id",
      });
    }
  }
  Role.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
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
      modelName: "Role",
      tableName: "roles",
    },
  );
  return Role;
};
