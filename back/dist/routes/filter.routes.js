"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const filter_controller_1 = require("../controllers/filter.controller");
const router = (0, express_1.Router)();
router.get('/documents', filter_controller_1.getFilteredDocuments); // GET /api/filter/documents
router.get('/options', filter_controller_1.getFilterOptions); // GET /api/filter/options
exports.default = router;
