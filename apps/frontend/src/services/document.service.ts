import { ApiService } from './api.service';
import { API_ROUTES } from '@/config/api.routes';

export interface Document {
  id: number;
  employee_id: number;
  name: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentUploadResponse {
  status: number;
  message: string;
  data: Document;
}

export interface DocumentListResponse {
  status: number;
  message: string;
  data: Document[];
}

export class DocumentService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService();
  }

  async uploadDocumentForEmployee(employeeId: number, file: File): Promise<Document> {
    try {
      console.log('Uploading document for employee:', employeeId);

      const formData = new FormData();
      formData.append('file', file);

      const response = await this.api.post<DocumentUploadResponse>(
        API_ROUTES.v1.api.employees.documents.upload(employeeId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('Document uploaded successfully:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async getDocumentsByEmployee(employeeId: number): Promise<Document[]> {
    try {
      console.log('Getting documents for employee:', employeeId);

      const response = await this.api.get<DocumentListResponse>(
        API_ROUTES.v1.api.employees.documents.list(employeeId),
      );

      console.log('Documents retrieved successfully:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  }

  async deleteDocument(documentId: number): Promise<void> {
    try {
      console.log('Deleting document:', documentId);

      await this.api.delete(API_ROUTES.v1.api.documents.delete(documentId));

      console.log('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
}

export const documentService = new DocumentService();
