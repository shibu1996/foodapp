import mongoose from 'mongoose';

// Production-grade MongoDB connection configuration
const mongooseOptions = {
  // Connection pool settings for high concurrency
  maxPoolSize: 100, // Maximum 100 connections in pool
  minPoolSize: 10,  // Minimum 10 connections ready
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  serverSelectionTimeoutMS: 10000, // Timeout after 10s if no server available
  
  // Connection retry settings
  retryWrites: true,
  retryReads: true,
  
  // Performance optimizations
  autoIndex: process.env.NODE_ENV !== 'production', // Disable in production
  autoCreate: true,
};

export const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-app';
    
    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Connection pool size: ${mongooseOptions.maxPoolSize}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });

    // Connect with optimized options
    await mongoose.connect(mongoUri, mongooseOptions);
    
    // Monitor connection pool
    const db = mongoose.connection.db;
    if (db) {
      const stats = await db.admin().serverStatus();
      console.log(`📈 Current connections: ${stats.connections?.current || 'N/A'}`);
    }
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Export connection instance for health checks
export const getConnectionStatus = () => {
  return {
    isConnected: mongoose.connection.readyState === 1,
    poolSize: mongoose.connection.client?.s?.options?.maxPoolSize || 0,
    currentConnections: mongoose.connection.client?.topology?.s?.pool?.totalConnectionCount || 0,
  };
};

