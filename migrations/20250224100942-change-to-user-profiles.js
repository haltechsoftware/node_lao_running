"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, update any NULL values to prevent constraint violations
    await queryInterface.sequelize.query(`
      UPDATE user_profiles 
      SET profile_image = '' 
      WHERE profile_image IS NULL
    `);

    await queryInterface.sequelize.query(`
      UPDATE user_profiles 
      SET profile_image_id = '' 
      WHERE profile_image_id IS NULL
    `);

    // Then change the columns to allow NULL
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
    // First, update any NULL values to prevent constraint violations
    await queryInterface.sequelize.query(`
      UPDATE user_profiles 
      SET profile_image = '' 
      WHERE profile_image IS NULL
    `);

    await queryInterface.sequelize.query(`
      UPDATE user_profiles 
      SET profile_image_id = '' 
      WHERE profile_image_id IS NULL
    `);

    // Then change the columns back to NOT NULL
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
