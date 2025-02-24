"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Otp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      console.log(models);

      // define association here
    }
  }
  Otp.init(
    {
      code: {
        type: DataTypes.TEXT,
      },
      phone: {
        type: DataTypes.TEXT,
      },
      expired_at: {
        type: DataTypes.DATE,
      },
      verified_at: {
        type: DataTypes.DATE,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    },
    {
      sequelize,
      modelName: "Otp",
      tableName: "otps",
    },
  );
  return Otp;
};
