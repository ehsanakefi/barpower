"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchDocumentsByTitle = exports.searchDocuments = void 0;
// Using mock Prisma client for development
// Replace with: import { PrismaClient } from '@prisma/client'; once database is set up
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Normalize Persian text for better search results
 * - Convert Arabic ی to Persian ی
 * - Convert Arabic ک to Persian ک
 * - Remove half-spaces (ZWNJ)
 */
const normalizePersianText = (text) => {
    return text
        .replace(/ي/g, 'ی') // Arabic ی to Persian ی
        .replace(/ك/g, 'ک') // Arabic ک to Persian ک
        .replace(/\u200C/g, ' ') // Replace ZWNJ (half-space) with regular space
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
};
const searchDocuments = async (filters) => {
    const results = [];
    // If title search is provided, do combined search
    if (filters.title) {
        const normalizedTitle = normalizePersianText(filters.title);
        // Search in documents with OR condition for both document and section titles
        const documents = await prisma.document.findMany({
            where: {
                OR: [
                    // Search in document titles
                    {
                        title: {
                            contains: normalizedTitle,
                            mode: 'insensitive',
                        },
                    },
                ],
                // Apply other filters
                ...(filters.doc_code && {
                    doc_code: {
                        contains: filters.doc_code,
                        mode: 'insensitive',
                    },
                }),
                ...(filters.issue_date_from || filters.issue_date_to) && {
                    issue_date: {
                        ...(filters.issue_date_from && { gte: filters.issue_date_from }),
                        ...(filters.issue_date_to && { lte: filters.issue_date_to }),
                    },
                },
            },
            include: {
                versions: {
                    orderBy: {
                        versionNumber: 'desc',
                    },
                    take: 1,
                },
            }
            // include: {
            //   sections: true,
            // },
        });
        // Process results and add ranking
        for (const doc of documents) {
            const normalizedDocTitle = normalizePersianText(doc.title);
            const docTitleMatch = normalizedDocTitle.toLowerCase().includes(normalizedTitle.toLowerCase());
            if (docTitleMatch) {
                // Document title match - higher relevance score
                results.push({
                    id: doc.id,
                    title: doc.title,
                    doc_code: doc.doc_code,
                    issue_date: doc.issue_date,
                    // file_url: doc.file_url,
                    file_url: doc.versions[0]?.file_url ?? '',
                    match_type: 'document_title',
                    relevance_score: 100,
                });
            }
            // Check for section matches
            // if (doc.sections) {
            //   for (const section of doc.sections) {
            //     const normalizedSectionTitle = normalizePersianText(section.title);
            //     if (normalizedSectionTitle.toLowerCase().includes(normalizedTitle.toLowerCase())) {
            //       // Section title match - lower relevance score
            //       results.push({
            //         id: doc.id,
            //         title: doc.title,
            //         doc_code: doc.doc_code,
            //         issue_date: doc.issue_date,
            //         file_url: doc.file_url,
            //         match_type: 'chunk_text',
            //         matched_section: {
            //           id: section.id,
            //           title: section.title,
            //           // section_type: section.section_type,
            //         },
            //         relevance_score: docTitleMatch ? 90 : 50, // Lower if only section matches
            //       });
            //     }
            //   }
            // }
        }
    }
    else {
        // Non-title search - use existing logic
        const whereConditions = {};
        if (filters.doc_code) {
            whereConditions.doc_code = {
                contains: filters.doc_code,
                mode: 'insensitive',
            };
        }
        if (filters.issue_date_from || filters.issue_date_to) {
            const dateConditions = {};
            if (filters.issue_date_from) {
                dateConditions.gte = filters.issue_date_from;
            }
            if (filters.issue_date_to) {
                dateConditions.lte = filters.issue_date_to;
            }
            whereConditions.issue_date = dateConditions;
        }
        const documents = await prisma.document.findMany({
            where: whereConditions,
            include: {
                versions: {
                    orderBy: {
                        versionNumber: 'desc',
                    },
                    take: 1,
                },
            },
            // include: {
            //   sections: true,
            // },
        });
        // Convert to search results format
        for (const doc of documents) {
            results.push({
                id: doc.id,
                title: doc.title,
                doc_code: doc.doc_code,
                issue_date: doc.issue_date,
                file_url: doc.versions[0]?.file_url ?? '',
                match_type: 'document_title',
                relevance_score: 80,
            });
        }
    }
    // Remove duplicates and sort by relevance score (highest first) then by date
    //   const uniqueResults = Array.from(
    //     // new Map(results.map(item => [`${item.id}-${item.match_type}-${item.matched_section?.id || ''}`, item])).values()
    //     new Map(
    //     results.map(item => [
    //         `${item.id}-${item.match_type}`,
    //         item
    //     ])
    // )
    //   );
    const uniqueResults = [...new Map(results.map(item => [`${item.id}-${item.match_type}`, item])).values()];
    return uniqueResults.sort((a, b) => {
        if (a.relevance_score !== b.relevance_score) {
            return b.relevance_score - a.relevance_score;
        }
        return ((b.issue_date?.getTime() ?? 0) -
            (a.issue_date?.getTime() ?? 0));
    });
};
exports.searchDocuments = searchDocuments;
const searchDocumentsByTitle = async (title) => {
    try {
        const normalizedTitle = normalizePersianText(title);
        const documents = await prisma.document.findMany({
            where: {
                title: {
                    contains: normalizedTitle,
                    mode: 'insensitive',
                },
            },
            select: {
                id: true,
                title: true,
                doc_code: true,
                issue_date: true,
                // file_url: true,
            },
            orderBy: {
                issue_date: 'desc',
            },
        });
        return documents;
    }
    catch (error) {
        throw new Error(`Error searching documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.searchDocumentsByTitle = searchDocumentsByTitle;
