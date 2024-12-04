'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('quotes', [
      {
        customer_id: 1,
        associate_id: 1,
        email: 'csci467receiver@gmail.com',
        secret_notes: 'This is a priority customer.',
        status: 'submitted',
        discount: 5.00,
        discount_type: 'percentage',
        total_amount: 500.00,
        final_discount: null,
        final_amount: null,
        commission_rate: null,
        processing_date: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        customer_id: 2,
        associate_id: 2,
        email: 'csci467receiver@gmail.com',
        secret_notes: null,
        status: 'draft',
        discount: 20.00,
        discount_type: 'amount',
        total_amount: 1200.00,
        final_discount: null,
        final_amount: null,
        commission_rate: null,
        processing_date: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('quotes', null, {});
  },
};