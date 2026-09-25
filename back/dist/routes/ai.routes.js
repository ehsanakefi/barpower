"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai.controller");
const router = (0, express_1.Router)();
router.post('/chat', ai_controller_1.sendMessage); // POST /api/ai/chat
router.get('/conversations/:conversationId', ai_controller_1.getConversationHistory); // GET /api/ai/conversations/:id
exports.default = router;
