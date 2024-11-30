module.exports = (sequelize, DataTypes) => {
  const Quote = sequelize.define(
    'Quote',
    {
      quoteId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'quote_id',
      },
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'customer_id',
      },
      associateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'associate_id',
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      secretNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'secret_notes',
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'draft',
      },
      discount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      discountType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'discount_type',
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'total_amount',
      },
      finalDiscount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'final_discount',
      },
      finalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'final_amount',
      },
      commissionRate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'commission_rate',
      },
      processingDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'processing_date',
      },
    },
    {
      tableName: 'quotes',
      timestamps: true,
      underscored: true,
    }
  );

  // Associations
  Quote.associate = function (models) {
    // A Quote belongs to a User (Sales Associate)
    Quote.belongsTo(models.User, { foreignKey: 'associate_id' });

    // A Quote has many LineItems
    Quote.hasMany(models.LineItem, { foreignKey: 'quote_id', as: 'items' });
  };

  return Quote;
};
