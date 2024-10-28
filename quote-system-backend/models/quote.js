module.exports = (sequelize, DataTypes) => {
    const Quote = sequelize.define('Quote', {
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
        defaultValue: 'draft', // Possible values: draft, finalized, sanctioned, ordered
      },
    }, {
      tableName: 'quotes',
      timestamps: true,
      underscored: true,
    });
  
    // Associations
    Quote.associate = function(models) {
      // A Quote belongs to a User (Sales Associate)
      Quote.belongsTo(models.User, { foreignKey: 'associate_id' });
  
      // A Quote has many LineItems
      Quote.hasMany(models.LineItem, { foreignKey: 'quote_id' });
    };
  
    return Quote;
  };
  