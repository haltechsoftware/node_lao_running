'use strict';
const bcrypt = require('bcryptjs')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', [{
      name: 'admin',
      email: 'admin@gmail.com',
      phone: '00000000',
      password: await bcrypt.hash('11111111', 10),
      is_active: true
    }, ], {
      returning: true
    }).then(user => {
      return queryInterface.bulkInsert('role_users', [{
        user_id: user,
        role_id: 1,
      }, ], {})
    });

    await queryInterface.bulkInsert('users', [{
      name: 'super_admin',
      email: 'super_admin@gmail.com',
      phone: '00000001',
      password: await bcrypt.hash('11111111', 10),
      is_active: true
    }, ], {
      returning: true
    }).then(user => {
      return queryInterface.bulkInsert('role_users', [{
        user_id: user,
        role_id: 3,
      }, ], {})
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('role_users', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};