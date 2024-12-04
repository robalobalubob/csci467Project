'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', [
      {
        name: 'John Doe',
        user_id: 'john.doe',
        password: 'password123',
        accumulated_commission: 1200.50,
        address: '123 Elm Street, Springfield',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Jane Smith',
        user_id: 'jane.smith',
        password: 'securepass',
        accumulated_commission: 800.00,
        address: '456 Oak Avenue, Shelbyville',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};