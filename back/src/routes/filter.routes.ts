import { Router } from 'express';
import { getFilteredDocuments, getFilterOptions } from '../controllers/filter.controller';

const router = Router();

router.get('/documents', getFilteredDocuments);  // GET /api/filter/documents
router.get('/options', getFilterOptions);        // GET /api/filter/options

export default router;
