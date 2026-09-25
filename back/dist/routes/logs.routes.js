"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logs_controller_1 = require("../controllers/logs.controller");
const router = (0, express_1.Router)();
router.get('/', logs_controller_1.getLogs); // GET /api/logs
router.get('/stats', logs_controller_1.getLogStats); // GET /api/logs/stats
router.post('/', logs_controller_1.createLog); // POST /api/logs
exports.default = router;
