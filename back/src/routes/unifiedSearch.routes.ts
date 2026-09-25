import { Router } from 'express';
import { unifiedSearchController } from '../controllers/unifiedSearch.controller';

const router = Router();

// Unified search route: GET /api/search?q=QUERY&mode=MODE
router.get('/', unifiedSearchController);

export default router;
