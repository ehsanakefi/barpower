import { Request, Response } from 'express';
import { searchDocuments, searchDocumentsByTitle, SearchFilters } from '../services/search.service';

export const searchController = async (req: Request, res: Response) => {
  try {
    const { title, doc_code, issue_date_from, issue_date_to } = req.query;

    if (title && !doc_code && !issue_date_from && !issue_date_to) {
      const documents = await searchDocumentsByTitle(title as string);

      return res.status(200).json({
        success: true,
        count: documents.length,
        data: documents,
        search_type: "simple_title",
      });
    }

    const filters: SearchFilters = {};

    if (title) filters.title = title as string;
    if (doc_code) filters.doc_code = doc_code as string;
    if (issue_date_from)
      filters.issue_date_from = new Date(issue_date_from as string);
    if (issue_date_to)
      filters.issue_date_to = new Date(issue_date_to as string);

    const results = await searchDocuments(filters);

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
      search_type: "advanced",
      filters: {
        title,
        doc_code,
        issue_date_from,
        issue_date_to,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while searching for documents",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// export const searchController = async (req: Request, res: Response) => {
//   try {
//     const { title, doc_code, issue_date_from, issue_date_to } = req.query;

//     // If only title is provided, use the simple title search for backward compatibility
//     if (title && !doc_code && !issue_date_from && !issue_date_to) {
//       const documents = await searchDocumentsByTitle(title as string);
//       return res.status(200).json({
//         success: true,
//         count: documents.length,
//         data: documents,
//         search_type: 'simple_title'
//       });
//     }

//     // For advanced search with multiple filters (including combined search)
//     const filters: SearchFilters = {};
    
//     if (title) filters.title = title as string;
//     if (doc_code) filters.doc_code = doc_code as string;
//     if (issue_date_from) {
//       filters.issue_date_from = new Date(issue_date_from as string);
//       }

//     if (issue_date_to) {
//       filters.issue_date_to = new Date(issue_date_to as string);
//     }

//     const results = await searchDocuments(filters);
    
//     // Group results by document and include match information
//     const groupedResults = results.reduce((acc, result) => {
//       const existingDoc = acc.find(doc => doc.id === result.id && doc.match_type === result.match_type);
      
//       if (existingDoc && result.matched_section) {
//         // Add to matched sections if it's a section match
//         if (!existingDoc.matched_sections) {
//           existingDoc.matched_sections = [];
//         }
//         existingDoc.matched_sections.push(result.matched_section);
//       } else {
//         // Create new entry
//         const docResult: any = {
//           id: result.id,
//           title: result.title,
//           doc_code: result.doc_code,
//           issue_date: result.issue_date,
//           file_url: result.file_url,
//           match_type: result.match_type,
//           relevance_score: result.relevance_score,
//         };
        
//         if (result.matched_section) {
//           docResult.matched_sections = [result.matched_section];
//         }
        
//         acc.push(docResult);
//       }
      
//       return acc;
//     }, [] as any[]);
    
//     return res.status(200).json({
//       success: true,
//       count: groupedResults.length,
//       data: groupedResults,
//       search_type: 'advanced',
//       filters: { title, doc_code, issue_date_from, issue_date_to }
//     });
//   } catch (error) {
//     console.error('Search controller error:', error);
//     return res.status(500).json({ 
//       success: false,
//       message: 'An error occurred while searching for documents', 
//       error: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// };