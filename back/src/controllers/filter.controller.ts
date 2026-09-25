import { Request, Response } from 'express';
import { filterService } from '../services/filter.service';

export const getFilteredDocuments = async (req: Request, res: Response) => {
  try {
    const filters = {
      documentCode: req.query.documentCode as string,
      approvalDate: req.query.approvalDate as string,
      issuingBodies: req.query.issuingBodies ? (req.query.issuingBodies as string).split(',') : [],
      technicalDomains: req.query.technicalDomains ? (req.query.technicalDomains as string).split(',') : [],
      searchQuery: req.query.q as string
    };
    
    const documents = await filterService.filterDocuments(filters);
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to filter documents',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getFilterOptions = async (req: Request, res: Response) => {
  try {
    const options = await filterService.getFilterOptions();
    res.json({ success: true, data: options });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch filter options',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
