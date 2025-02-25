"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Set default values for existing NULL entries
    await queryInterface.sequelize.query(`
      UPDATE user_profiles 
      SET profile_image = '', profile_image_id = ''
      WHERE profile_image IS NULL OR profile_image_id IS NULL
    `);

    // Drop existing columns and recreate them with nullable constraint
    await queryInterface.removeColumn("user_profiles", "profile_image");
    await queryInterface.addColumn("user_profiles", "profile_image", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.removeColumn("user_profiles", "profile_image_id");
    await queryInterface.addColumn("user_profiles", "profile_image_id", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Set default values for existing NULL entries
    await queryInterface.sequelize.query(`
      UPDATE user_profiles 
      SET profile_image = '', profile_image_id = ''
      WHERE profile_image IS NULL OR profile_image_id IS NULL
    `);

    // Drop and recreate with NOT NULL constraint
    await queryInterface.removeColumn("user_profiles", "profile_image");
    await queryInterface.addColumn("user_profiles", "profile_image", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    });

    await queryInterface.removeColumn("user_profiles", "profile_image_id");
    await queryInterface.addColumn("user_profiles", "profile_image_id", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    });
  },
};
