'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('line_items', [
      {
        quote_id: 1, 
        description: 'High-end laptop',
        price: 400.00,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        quote_id: 1, 
        description: 'Wireless mouse',
        price: 50.00,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        quote_id: 2, 
        description: 'Office desk',
        price: 600.00,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        quote_id: 2, 
        description: 'Office chair',
        price: 200.00,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('line_items', null, {});
  },
};