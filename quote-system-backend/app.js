const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

app.use('/api', routes);

// Root Route
app.get('/', (req, res) => {
    res.send('Welcome to the Quote System Backend API!');
  });

app.use('/api', routes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({error: 'Something went wrong!'});
})

const PORT = process.env.PORT || 3000;
sequelize.authenticate().then(() => {
    console.log('Database connected...');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
})
