const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      associateId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'associate_id', // Maps to database column 'associate_id'
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Enforce uniqueness for login IDs
        field: 'user_id',
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accumulatedCommission: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        field: 'accumulated_commission',
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    }, {
      tableName: 'users', // Specify the table name if you want to customize it
      timestamps: true, // Adds createdAt and updatedAt fields
      underscored: true, // Use snake_case column names in the database
    });
  
    // Associations
    User.associate = function(models) {
      // A User has many Quotes
      User.hasMany(models.Quote, { foreignKey: 'associate_id' });
    };
  
    return User;
  };
  