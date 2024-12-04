'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', [
      {
        associate_id: 1,
        name: 'John Doe',
        user_id: 'john.doe',
        password: 'password123',
        address: 'Cool Place Ave',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        associate_id: 2,
        name: 'Jane Smith',
        user_id: 'jane.smith',
        password: 'password456',
        address: 'Warm Place Ave',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Delete all entries from the 'users' table
    await queryInterface.bulkDelete('users', null, {});
  },
};