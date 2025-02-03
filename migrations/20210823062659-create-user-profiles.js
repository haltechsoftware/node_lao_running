'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_profiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'cascade'
      },
      bib: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      surname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      gender: {
        type: Sequelize.ENUM('male', 'female'),
        allowNull: false
      },
      range: {
        type: Sequelize.ENUM,
        values: ['free', '15', '42', '100', '200'],
        allowNull: true,
      },
      dob: {
        type: Sequelize.DATE,
        allowNull: false
      },
      size_shirt: {
        type: Sequelize.STRING,
        allowNull: true
      },
      national_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'nationals',
          key: 'id'
        }
      },
      hal_branche_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'hal_branches',
          key: 'id'
        }
      },
      profile_image: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      profile_image_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        default: Sequelize.CURRENT_TIMESTAMP
      },
      updatedAt: {
        type: Sequelize.DATE,
        default: Sequelize.CURRENT_TIMESTAMP
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_profiles');
  }
};