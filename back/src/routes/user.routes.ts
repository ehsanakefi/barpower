import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUserRole, toggleUserStatus, getUserStats } from '../controllers/user.controller';

const router = Router();

router.get('/', getUsers);                    // GET /api/users
router.get('/stats', getUserStats);           // GET /api/users/stats
router.get('/:id', getUserById);              // GET /api/users/:id
router.post('/', createUser);                 // POST /api/users
router.put('/:id/role', updateUserRole);      // PUT /api/users/:id/role
router.put('/:id/toggle-status', toggleUserStatus); // PUT /api/users/:id/toggle-status

export default router;
