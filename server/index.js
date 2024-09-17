const connectToMongo = require('./db'); // initializing db file
const express = require('express'); // Initializing
const cors = require('cors'); // Importing CORS
require('dotenv').config();

connectToMongo(); //! Running db server

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());

// parsing body
app.use(express.json());

// Available Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/command', require('./routes/command'));

app.listen(port, () => {
    console.log(`CSTR now live on port ${port}`);
});
