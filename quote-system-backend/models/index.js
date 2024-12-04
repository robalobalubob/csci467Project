const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);

require('dotenv').config();

const mainDBConfig = {
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || 'quote_system',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || '3306',
  dialect: 'mysql',
  logging: false,
};

const legacyDBConfig = {
  username: 'student',
  password: 'student',
  database: 'csci467',
  host: 'blitz.cs.niu.edu',
  port: 3306,
  dialect: 'mysql',
  logging: false,
};

const db = {};

// Initialize Sequelize instances
const sequelize = new Sequelize(
  mainDBConfig.database,
  mainDBConfig.username,
  mainDBConfig.password,
  mainDBConfig
);

const legacySequelize = new Sequelize(
  legacyDBConfig.database,
  legacyDBConfig.username,
  legacyDBConfig.password,
  legacyDBConfig
);

// Load main database models
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file !== 'legacyCustomer.js'
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Set up associations for main database models
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Load legacy database models
const LegacyCustomer = require('./legacyCustomer')(
  legacySequelize,
  Sequelize.DataTypes
);

// Export models and Sequelize instances
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.legacySequelize = legacySequelize;
db.LegacyCustomer = LegacyCustomer;

module.exports = db;