module.exports = (sequelize, DataTypes) => {
    const LegacyCustomer = sequelize.define(
      'LegacyCustomer',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(50),
        },
        city: {
          type: DataTypes.STRING(50),
        },
        street: {
          type: DataTypes.STRING(50),
        },
        contact: {
          type: DataTypes.STRING(50),
        },
      },
      {
        tableName: 'customers',
        timestamps: false,
      }
    );
  
    return LegacyCustomer;
  };