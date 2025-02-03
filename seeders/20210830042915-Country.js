'use strict';
const Country = require('countries-list')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const countryList = Country.countries;
    const nameList = []
    Object.keys(countryList).map((key) => {
      nameList.push({
        name: countryList[key].name,
        native: countryList[key].native,
        phone: countryList[key].phone,
        currency: countryList[key].currency,
        continent: countryList[key].continent,
        capital: countryList[key].capital,
      })
    })
    await queryInterface.bulkInsert('nationals', nameList, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('nationals', null, {});
  }
};