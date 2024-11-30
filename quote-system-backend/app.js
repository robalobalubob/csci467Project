const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize, legacySequelize } = require('./models');
const routes = require('./routes');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(
    cors({
      origin: /^http:\/\/localhost:\d+$/,
    })
  );

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

app.use('/api/auth', authRoutes);

app.use('/api/admin', adminRoutes);

// Root Route
app.get('/', (req, res) => {
    res.send('Welcome to the Quote System Backend API!');
  });

app.use('/api', routes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({error: 'Something went wrong!'});
});

const PORT = process.env.PORT || 3000;
async function startServer() {
    try {
      await sequelize.authenticate();
      console.log('Main database connected...');
  
      await legacySequelize.authenticate();
      console.log('Legacy database connected...');
  
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (err) {
      console.error('Unable to connect to the databases:', err);
    }
}
  
startServer();
