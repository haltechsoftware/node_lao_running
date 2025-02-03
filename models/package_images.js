'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PackageImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PackageImage.belongsTo(models.Package, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
        foreignKey: 'package_id'
      })
    }
  };
  PackageImage.init({
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'packages',
        key: 'id'
      },
    },
    value: DataTypes.STRING,
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
    modelName: 'PackageImage',
    tableName: 'package_images',
  });
  return PackageImage;
};