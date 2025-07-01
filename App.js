const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectToMongo = require('./config/db');
const PORT = process.env.PORT || 5000;

dotenv.config();

const app = express();
const cookieParser = require('cookie-parser');

// Add this before your routes
app.use(cookieParser());
app.use(cors({
  origin: 'https://splitmoney-frontend.vercel.app' || 'http://localhost:5173', 
  // origin:  'http://localhost:5173', 
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/group', require('./routes/groupRoutes'));
app.use('/api/expense', require('./routes/expenseRoutes'));

const startServer = async () => {
  try {
    await connectToMongo();
    app.get('/', (req, res) => {
      res.send('Hello World! The Static ips have been added deployed!!!');
    });

    app.listen(PORT, () => {
      console.log(`Example app listening on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Error starting server: ${error.message}`);
  }
};

startServer();