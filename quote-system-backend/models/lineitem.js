module.exports = (sequelize, DataTypes) => {
    const LineItem = sequelize.define('LineItem', {
      lineItemId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'line_item_id',
      },
      quoteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'quote_id',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    }, {
      tableName: 'line_items',
      timestamps: true,
      underscored: true,
    });
  
  // Associations
  LineItem.associate = function(models) {
    // A LineItem belongs to a Quote
    LineItem.belongsTo(models.Quote, { foreignKey: 'quote_id' });
  };

  return LineItem;
};