"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("user_profiles", "profile_image", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn("user_profiles", "profile_image_id", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("user_profiles", "profile_image", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("user_profiles", "profile_image_id", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
