require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/veloop_giveaway_mock';

const startGiveawayCron = require('./src/jobs/giveawayCron');

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start automatic giveaway finalization cron job
    startGiveawayCron();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    // For development/mock purposes, if MongoDB isn't running, we still start the server 
    // (though real endpoints will fail, mock ones will work).
    console.log('Starting server without DB connection for frontend development mock.');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (NO DATABASE)`);
    });
  });
