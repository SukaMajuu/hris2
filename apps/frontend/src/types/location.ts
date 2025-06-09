export interface Location {
	id: number;
	name: string;
	address_detail: string;
	latitude: number;
	longitude: number;
	radius_m: number;
}

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
	name: string;
	address_detail: string;
	latitude: number;
	longitude: number;
	radius_m: number;
}

export interface LocationFormData {
	id?: number;
	name?: string;
	address_detail?: string;
	latitude?: number;
	longitude?: number;
	radius_m?: number | string;
}

// New filter interface for enhanced filtering
export interface LocationFilterOptions {
	name?: string;
	address_detail?: string;
	radius_range?: string;
	sort_by?: string;
	sort_order?: "asc" | "desc";
}

// Enhanced location list query parameters
export interface LocationListParams extends Record<string, string | number | undefined> {
	page?: number;
	page_size?: number;
	name?: string;
	address_detail?: string;
	radius_range?: string;
	sort_by?: string;
	sort_order?: "asc" | "desc";
}
