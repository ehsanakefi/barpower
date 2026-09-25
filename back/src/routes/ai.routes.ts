import { Router } from 'express';
import { sendMessage, getConversationHistory } from '../controllers/ai.controller';

const router = Router();

router.post('/chat', sendMessage);                           // POST /api/ai/chat
router.get('/conversations/:conversationId', getConversationHistory); // GET /api/ai/conversations/:id

export default router;
