"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const unifiedSearch_controller_1 = require("../controllers/unifiedSearch.controller");
const router = (0, express_1.Router)();
// Unified search route: GET /api/search?q=QUERY&mode=MODE
router.get('/', unifiedSearch_controller_1.unifiedSearchController);
exports.default = router;
