import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import documentRoutes from './routes/document.routes';
import searchRoutes from './routes/search.routes';
import unifiedSearchRoutes from './routes/unifiedSearch.routes';
import userRoutes from './routes/user.routes';
import logsRoutes from './routes/logs.routes';
import notificationsRoutes from './routes/notifications.routes';
import aiRoutes from './routes/ai.routes';
import filterRoutes from './routes/filter.routes';
import { connectToDatabase } from './database/connection';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to database
connectToDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/documents/search', searchRoutes);  // Legacy search endpoint
app.use('/api/search', unifiedSearchRoutes);     // New unified search endpoint
app.use('/api/admin/documents', documentRoutes);  // Admin endpoint for adding documents
app.use('/api/users', userRoutes);               // User management endpoints
app.use('/api/logs', logsRoutes);                // System logs endpoints
app.use('/api/notifications', notificationsRoutes); // Notifications endpoints
app.use('/api/ai', aiRoutes);                    // AI assistant endpoints
app.use('/api/filter', filterRoutes);            // Filter endpoints
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'DocPower Backend API is running!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 DocPower Backend Server is running on http://localhost:${PORT}`);
  console.log(`📚 Document Search API: http://localhost:${PORT}/api/documents/search`);
  console.log(`🔧 Admin API: http://localhost:${PORT}/api/admin/documents`);
  console.log(`💊 Health Check: http://localhost:${PORT}/health`);
});
