import { ApiService } from './api.service';
import { API_ROUTES } from '@/config/api.routes';

export interface LeaveRequestData {
  employee_id?: number;
  leave_type: string;
  start_date: string;
  end_date?: string;
  attachment?: File | null;
  employee_note?: string;
  latitude?: string;
  longitude?: string;
}

export interface LeaveRequestResponse {
  status: number;
  message: string;
  data: {
    id: number;
    employee_id: number;
    leave_type: string;
    start_date: string;
    end_date?: string;
    attachment?: string;
    employee_note?: string;
    status: 'Waiting Approval' | 'Approved' | 'Rejected';
    created_at: string;
    updated_at: string;
  };
}

export class LeaveRequestService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService();
  }

  async submitLeaveRequest(data: LeaveRequestData): Promise<LeaveRequestResponse> {
    try {
      // For now, we'll use a placeholder endpoint until the backend is implemented
      // This can be updated to use the actual leave request endpoint when available
      console.log('Submitting leave request:', data);
      
      // Simulate API response - replace with actual API call when endpoint is available
      // const response = await this.api.post<LeaveRequestResponse>(
      //   '/api/leave-requests',
      //   data
      // );
      
      // Mock response for now
      const mockResponse: LeaveRequestResponse = {
        status: 201,
        message: 'Leave request submitted successfully',
        data: {
          id: Math.floor(Math.random() * 1000),
          employee_id: 1, // This should come from auth context
          leave_type: data.leave_type,
          start_date: data.start_date,
          end_date: data.end_date,
          attachment: data.attachment ? 'uploaded_file.pdf' : undefined,
          employee_note: data.employee_note,
          status: 'Waiting Approval',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockResponse;
    } catch (error) {
      console.error('Error submitting leave request:', error);
      throw new Error('Failed to submit leave request. Please try again.');
    }
  }

  async uploadAttachment(file: File): Promise<{ url: string }> {
    try {
      // For now, simulate file upload
      // In the future, this could use the document upload endpoint
      console.log('Uploading attachment:', file.name);
      
      // Mock file upload - replace with actual upload when endpoint is available
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await this.api.post<{ url: string }>(
      //   API_ROUTES.v1.api.documents.upload,
      //   formData
      // );
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        url: `uploads/leave-attachments/${Date.now()}_${file.name}`
      };
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw new Error('Failed to upload attachment. Please try again.');
    }
  }
}

export const leaveRequestService = new LeaveRequestService();
