"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const document_routes_1 = __importDefault(require("./routes/document.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const unifiedSearch_routes_1 = __importDefault(require("./routes/unifiedSearch.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const logs_routes_1 = __importDefault(require("./routes/logs.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const filter_routes_1 = __importDefault(require("./routes/filter.routes"));
const connection_1 = require("./database/connection");
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Connect to database
(0, connection_1.connectToDatabase)();
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/documents', document_routes_1.default);
app.use('/api/documents/search', search_routes_1.default); // Legacy search endpoint
app.use('/api/search', unifiedSearch_routes_1.default); // New unified search endpoint
app.use('/api/admin/documents', document_routes_1.default); // Admin endpoint for adding documents
app.use('/api/users', user_routes_1.default); // User management endpoints
app.use('/api/logs', logs_routes_1.default); // System logs endpoints
app.use('/api/notifications', notifications_routes_1.default); // Notifications endpoints
app.use('/api/ai', ai_routes_1.default); // AI assistant endpoints
app.use('/api/filter', filter_routes_1.default); // Filter endpoints
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
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
app.use((error, req, res, next) => {
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
