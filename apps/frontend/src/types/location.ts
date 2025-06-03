export interface LocationResponse {
  id: number; 
  name: string;
  address_detail: string; 
  latitude: number;
  longitude: number;
  radius_m: number; 
  created_at?: string;
  updated_at?: string;
}

export interface CreateLocationRequest {
  name: string;
  address_detail: string;
  latitude: number;
  longitude: number;
  radius_m: number; 
}

export interface UpdateLocationRequest {
  name?: string;
  address_detail?: string;
  latitude?: number;
  longitude?: number;
  radius_m?: number;
}

export interface LocationFormData {
  id?: number;
  name?: string;
  address_detail?: string;
  latitude?: number;
  longitude?: number;
  radius_m?: number | string; 
}