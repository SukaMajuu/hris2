import { ApiService } from './api.service';

export interface Branch {
  id: number;
  name: string;
  hrId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchRequest {
  name: string;
}

export interface UpdateBranchRequest {
  name: string;
}

export interface BranchApiResponse {
  message: string;
  data: Branch;
}

export interface BranchesApiResponse {
  message: string;
  data: Branch[];
}

class BranchService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService();
  }

  async getMyBranches(): Promise<Branch[]> {
    try {
      console.log('Fetching branches from API...');
      const response = await this.api.get<BranchesApiResponse>('/api/branches');
      console.log('Branches API response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  }

  async createBranch(data: CreateBranchRequest): Promise<Branch> {
    try {
      console.log('Creating branch with data:', data);
      const response = await this.api.post<BranchApiResponse>('/api/branches', data);
      console.log('Create branch API response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    }
  }

  async updateBranch(id: number, data: UpdateBranchRequest): Promise<Branch> {
    const response = await this.api.put<BranchApiResponse>(`/api/branches/${id}`, data);
    return response.data.data;
  }

  async deleteBranch(id: number): Promise<void> {
    await this.api.delete(`/api/branches/${id}`);
  }
}

export const branchService = new BranchService();
