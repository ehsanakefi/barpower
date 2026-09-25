"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_controller_1 = require("../controllers/search.controller");
const router = (0, express_1.Router)();
// Search route: GET /api/documents/search
router.get('/', search_controller_1.searchController);
exports.default = router;
