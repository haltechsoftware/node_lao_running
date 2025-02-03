'use strict';
import {
  Model
} from 'sequelize';
import Moment from 'moment'

module.exports = (sequelize, DataTypes) => {
  class UserProfile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserProfile.belongsTo(models.User, {
        foreignKey: 'user_id'
      })
      UserProfile.belongsTo(models.HalBranche, {
        foreignKey: 'hal_branche_id'
      })
      UserProfile.belongsTo(models.National, {
        foreignKey: 'national_id'
      })
    }

    toJSON() {
      return {
        ...this.get(),
        dob: Moment(this.dob).format('YYYY-MM-DD')
      }
    }
  };


  UserProfile.init({
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
    bib: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: false
    },
    dob: {
      type: DataTypes.DATE,
      allowNull: false
    },
    national_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'nationals',
        key: 'id'
      }
    },
    range: {
      type: DataTypes.ENUM,
      values: ['free', '15', '42', '100', '200'],
      allowNull: true,
      defaultValue: 'free'
    },
    size_shirt: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hal_branche_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'hal_branches',
        key: 'id'
      }
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profile_image_id: {
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
    modelName: 'UserProfile',
    tableName: 'user_profiles',
  });
  return UserProfile;
};