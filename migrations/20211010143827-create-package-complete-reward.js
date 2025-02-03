'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('package_complete_rewards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      package_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'packages',
          key: 'id'
        },
      },
      winner_type_la: {
        type: Sequelize.ENUM('ຈາກ​ການ​ສຸ່ມສະ​ເພາະ​ຜູ້​ທີ່​ແລ່ນ​ຕາມ​ເປົ້າ​ໝາຍ', 'ໄດ້ທັນທີເມື່ອແລ່ນຄົບຕາມເປົ້າໝາຍ'),
        allowNull: false
      },
      winner_type_en: {
        type: Sequelize.ENUM('From a lucky draw', 'When complete the goal'),
        allowNull: false
      },
      ranking_en: {
        type: Sequelize.ENUM('1st', '2nd', '3rd', 'none'),
        allowNull: false
      },
      ranking_la: {
        type: Sequelize.ENUM('ທີ 1', 'ທີ 2', 'ທີ 3', 'ບໍ່ຈັດອັນດັບ'),
        allowNull: false
      },
      prize_la: {
        type: Sequelize.STRING
      },
      prize_en: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('package_complete_rewards');
  }
};