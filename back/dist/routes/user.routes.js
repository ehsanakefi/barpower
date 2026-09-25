"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
router.get('/', user_controller_1.getUsers); // GET /api/users
router.get('/stats', user_controller_1.getUserStats); // GET /api/users/stats
router.get('/:id', user_controller_1.getUserById); // GET /api/users/:id
router.post('/', user_controller_1.createUser); // POST /api/users
router.put('/:id/role', user_controller_1.updateUserRole); // PUT /api/users/:id/role
router.put('/:id/toggle-status', user_controller_1.toggleUserStatus); // PUT /api/users/:id/toggle-status
exports.default = router;
