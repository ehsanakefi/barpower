"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationHistory = exports.sendMessage = void 0;
const ai_service_1 = require("../services/ai.service");
const sendMessage = async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }
        const response = await ai_service_1.aiService.processMessage(message, conversationId);
        res.json({ success: true, data: response });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to process message',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.sendMessage = sendMessage;
const getConversationHistory = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const history = await ai_service_1.aiService.getConversationHistory(String(conversationId));
        res.json({ success: true, data: history });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversation history',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getConversationHistory = getConversationHistory;
