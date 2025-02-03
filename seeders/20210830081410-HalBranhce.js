'use strict';
const axios = require('axios')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seed Provices.
    const provinces = await axios.get('https://hal.hal-logistics.la/api/v1/listing/provinces')
    const provinceLists = []
    provinces.data.map((province) => {
      provinceLists.push({
        id: province.id,
        name: province.name,
      })
    })
    await queryInterface.bulkInsert('provinces', provinceLists, {});

    // Seed Districts.
    const districts = await axios.get('https://hal.hal-logistics.la/api/v1/listing/districts')
    const districtLists = []
    districts.data.map((district) => {
      districtLists.push({
        id: district.id,
        name: district.name,
        province_id: district.province_id,
      })
    })
    await queryInterface.bulkInsert('districts', districtLists, {});

    // Seed HalBranches.
    const branches = await axios.get('https://hal.hal-logistics.la/api/v1/listing/branches')
    const brancheLists = []
    branches.data.map((branche) => {
      brancheLists.push({
        id: branche.id,
        name: branche.name,
        tel: branche.tel,
        email: branche.email,
        prefix: branche.prefix,
        lat: branche.lat,
        lng: branche.lng,
        district_id: branche.district.id,
      })
    })

    await queryInterface.bulkInsert('hal_branches', brancheLists, {});
    await queryInterface.bulkInsert('hal_branches', [{
      id: 1000,
      name: "EVO Store",
      tel: '',
      email: '',
      prefix: '',
      lat: '',
      lng: '',
      district_id: 88,
    }], {});

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('provinces', null, {});
    await queryInterface.bulkDelete('districts', null, {});
    await queryInterface.bulkDelete('hal_branches', null, {});


  }
};