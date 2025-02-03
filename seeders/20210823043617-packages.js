'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('packages', [{
      name: 'Starter',
      price: process.env.NODE_ENV == "production"
        ? 149000
        : 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Pro',
      price: process.env.NODE_ENV == "production"
        ? 199000
        : 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    ], {})
  },


  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('packages', null, {});

  }
};