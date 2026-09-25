"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilterOptions = exports.getFilteredDocuments = void 0;
const filter_service_1 = require("../services/filter.service");
const getFilteredDocuments = async (req, res) => {
    try {
        const filters = {
            documentCode: req.query.documentCode,
            approvalDate: req.query.approvalDate,
            issuingBodies: req.query.issuingBodies ? req.query.issuingBodies.split(',') : [],
            technicalDomains: req.query.technicalDomains ? req.query.technicalDomains.split(',') : [],
            searchQuery: req.query.q
        };
        const documents = await filter_service_1.filterService.filterDocuments(filters);
        res.json({ success: true, data: documents });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to filter documents',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getFilteredDocuments = getFilteredDocuments;
const getFilterOptions = async (req, res) => {
    try {
        const options = await filter_service_1.filterService.getFilterOptions();
        res.json({ success: true, data: options });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch filter options',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getFilterOptions = getFilterOptions;
