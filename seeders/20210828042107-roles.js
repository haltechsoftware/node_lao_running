"use strict";

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      "roles",
      [
        {
          name: "Admin",
        },
        {
          name: "User",
        },
        {
          name: "Super_Admin",
        },
      ],
      {},
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("roles", null, {});
  },
};
