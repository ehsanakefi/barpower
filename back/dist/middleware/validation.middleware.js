"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSearchQuery = exports.validateDocumentCreation = void 0;
const express_validator_1 = require("express-validator");
exports.validateDocumentCreation = [
    (0, express_validator_1.body)('title').isString().notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('doc_code').isString().notEmpty().withMessage('Document code is required'),
    (0, express_validator_1.body)('issue_date').isDate().withMessage('Issue date must be a valid date'),
    (0, express_validator_1.body)('file_url').isURL().withMessage('File URL must be a valid URL'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
exports.validateSearchQuery = [
    (0, express_validator_1.body)('title').optional().isString().withMessage('Title must be a string'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
