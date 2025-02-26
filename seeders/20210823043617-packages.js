"use strict";

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      "packages",
      [
        {
          name: "40KM/240,000",
          price: 240000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "40KM/440,000",
          price: 440000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "90KM/290,000",
          price: 290000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "90KM/490,000",
          price: 490000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("packages", null, {});
  },
};
