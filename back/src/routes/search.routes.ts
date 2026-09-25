import { Router } from 'express';
import { searchController } from '../controllers/search.controller';

const router = Router();

// Search route: GET /api/documents/search
router.get('/', searchController);

export default router;