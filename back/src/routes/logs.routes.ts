import { Router } from 'express';
import { getLogs, getLogStats, createLog } from '../controllers/logs.controller';

const router = Router();

router.get('/', getLogs);           // GET /api/logs
router.get('/stats', getLogStats);  // GET /api/logs/stats
router.post('/', createLog);        // POST /api/logs

export default router;
