"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSearchQuery = exports.validateDocumentTitle = void 0;
const express_validator_1 = require("express-validator");
exports.validateDocumentTitle = [
    (0, express_validator_1.body)('title')
        .isString()
        .withMessage('Title must be a string')
        .notEmpty()
        .withMessage('Title is required'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
exports.validateSearchQuery = [
    (0, express_validator_1.body)('query')
        .isString()
        .withMessage('Search query must be a string')
        .notEmpty()
        .withMessage('Search query is required'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
