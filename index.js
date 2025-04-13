const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Add CORS middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://your-frontend-domain.com' : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
  app.use(compression());
  
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://your-frontend-domain.com');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
  });
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const authRoutes = require('./Modules/Auth/Auth');
const adaptiveRouter = require('./Modules/Adaptive/adaptive.js');

console.log('Auth Routes:', authRoutes);
console.log('Adaptive Routes:', adaptiveRouter);

// Mount the adaptive router
console.log('Mounting adaptive router at /api/adaptive');
app.use('/api/adaptive', adaptiveRouter);

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

app.use('/api/auth', authRoutes);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();