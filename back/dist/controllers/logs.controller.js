"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLog = exports.getLogStats = exports.getLogs = void 0;
const logs_service_1 = require("../services/logs.service");
const getLogs = async (req, res) => {
    try {
        const { type, limit } = req.query;
        const logs = await logs_service_1.logsService.getLogs(type, limit ? parseInt(limit) : undefined);
        res.json({ success: true, data: logs });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch logs',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getLogs = getLogs;
const getLogStats = async (req, res) => {
    try {
        const stats = await logs_service_1.logsService.getLogStats();
        res.json({ success: true, data: stats });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch log stats',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getLogStats = getLogStats;
const createLog = async (req, res) => {
    try {
        const { type, message, user, details } = req.body;
        if (!type || !message || !user) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        const log = await logs_service_1.logsService.createLog({ type, message, user, details });
        res.status(201).json({ success: true, data: log });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create log',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.createLog = createLog;
