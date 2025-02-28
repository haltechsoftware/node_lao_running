"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("packages", "range", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "price",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("packages", "range");
  },
};
