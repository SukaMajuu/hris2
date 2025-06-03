import { ApiService } from './api.service';

export interface Position {
  id: number;
  name: string;
  hrId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePositionRequest {
  name: string;
}

export interface UpdatePositionRequest {
  name: string;
}

export interface PositionApiResponse {
  message: string;
  data: Position;
}

export interface PositionsApiResponse {
  message: string;
  data: Position[];
}

class PositionService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService();
  }

  async getMyPositions(): Promise<Position[]> {
    const response = await this.api.get<PositionsApiResponse>('/api/positions');
    return response.data.data;
  }

  async createPosition(data: CreatePositionRequest): Promise<Position> {
    const response = await this.api.post<PositionApiResponse>('/api/positions', data);
    return response.data.data;
  }

  async updatePosition(id: number, data: UpdatePositionRequest): Promise<Position> {
    const response = await this.api.put<PositionApiResponse>(`/api/positions/${id}`, data);
    return response.data.data;
  }

  async deletePosition(id: number): Promise<void> {
    await this.api.delete(`/api/positions/${id}`);
  }
}

export const positionService = new PositionService();
