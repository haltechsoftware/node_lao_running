'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PackageCompleteReward extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PackageCompleteReward.belongsTo(models.Package, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
        foreignKey: 'package_id'
      })
    }
  };
  PackageCompleteReward.init({
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'packages',
        key: 'id'
      },
    },
    winner_type_la: {
      type: DataTypes.ENUM('ຈາກ​ການ​ສຸ່ມສະ​ເພາະ​ຜູ້​ທີ່​ແລ່ນ​ຕາມ​ເປົ້າ​ໝາຍ', 'ໄດ້ທັນທີເມື່ອແລ່ນຄົບຕາມເປົ້າໝາຍ'),
      allowNull: false
    },
    winner_type_en: {
      type: DataTypes.ENUM('From a lucky draw', 'When complete the goal'),
      allowNull: false
    },
    ranking_en: {
      type: DataTypes.ENUM('1st', '2nd', '3rd', 'none'),
      allowNull: false
    },
    ranking_la: {
      type: DataTypes.ENUM('ທີ 1', 'ທີ 2', 'ທີ 3', 'ບໍ່ຈັດອັນດັບ'),
      allowNull: false
    },
    prize_la: {
      type: DataTypes.STRING
    },
    prize_en: {
      type: DataTypes.STRING
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
    modelName: 'PackageCompleteReward',
    tableName: 'package_complete_rewards',
  });
  return PackageCompleteReward;
};