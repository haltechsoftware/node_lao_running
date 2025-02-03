'use strict';
import {
  Model
}
  from 'sequelize';
import Message from '../app/helpers/message.helper'

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasOne(models.UserProfile, {
        foreignKey: 'user_id'
      })

      User.hasOne(models.UserPackage, {
        foreignKey: 'user_id'
      })

      User.hasMany(models.RunResult, {
        foreignKey: 'user_id'
      })

      User.belongsToMany(models.Role, {
        through: models.RoleUser,
        foreignKey: 'user_id',
      })

      User.hasOne(models.Ranking, {
        foreignKey: 'user_id'
      })

      User.belongsTo(models.Package, {
        foreignKey: 'package_id'
      })
    }
  };
  User.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'packages',
        key: 'id'
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: Message.validation('is_email', 'users.email')
        },
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sub: {
      type: DataTypes.STRING,
      allowNull: true
    },
    token: {
      type: DataTypes.STRING,
    },
    resetPasswordAt: {
      type: DataTypes.DOUBLE,
      allowNull: true
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
    modelName: 'User',
    tableName: 'users',
  });
  return User;
};