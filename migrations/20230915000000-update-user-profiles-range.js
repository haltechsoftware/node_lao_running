"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // For MySQL, we need to modify the column with a new enum definition
    await queryInterface.sequelize.query(
      "ALTER TABLE `user_profiles` MODIFY COLUMN `range` ENUM('free', '15', '40', '42', '90', '100', '200')",
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Revert back to original enum values
    // await queryInterface.sequelize.query(
    //   "ALTER TABLE `user_profiles` MODIFY COLUMN `range` ENUM('free', '15', '42', '100', '200')",
    // );
  },
};
