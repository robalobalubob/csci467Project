const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      associateId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'associate_id', 
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
      tableName: 'users', 
      timestamps: true, 
      underscored: true, 
    });
  
    // Associations
    User.associate = function(models) {
      // A User has many Quotes
      User.hasMany(models.Quote, { foreignKey: 'associate_id' });
    };
  
    return User;
  };
  