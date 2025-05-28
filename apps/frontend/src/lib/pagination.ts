export interface PaginationParams {
	page: number;
	pageSize: number;
}

export interface PaginationResult<T> {
	totalItems: number;
	totalPages: number;
	currentPage: number;
	pageSize: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
	items: T[];
}

export interface PaginationResponse {
	total_items: number;
	total_pages: number;
	current_page: number;
	page_size: number;
	has_next_page: boolean;
	has_prev_page: boolean;
	[key: string]: unknown;
}

export function createPaginationParams(
	page = 1,
	pageSize = 10
): PaginationParams {
	return {
		page: Math.max(1, page),
		pageSize: Math.min(100, Math.max(1, pageSize)),
	};
}

export function calculatePaginationResult<T>(
	data: PaginationResponse,
	itemsKey: string = "items"
): PaginationResult<T> {
	const items = (data[itemsKey] as T[]) || [];
	const totalItems = data.total_items || 0;
	const totalPages = data.total_pages || 1;
	const currentPage = data.current_page || 1;
	const pageSize = data.page_size || 10;
	const hasNextPage = data.has_next_page || false;
	const hasPrevPage = data.has_prev_page || false;

	return {
		totalItems,
		totalPages,
		currentPage,
		pageSize,
		hasNextPage,
		hasPrevPage,
		items,
	};
}

export function createPaginationQueryParams(
	params: PaginationParams
): Record<string, string> {
	return {
		page: params.page.toString(),
		page_size: params.pageSize.toString(),
	};
}

export function updateUrlWithPagination(
	url: string,
	params: PaginationParams
): string {
	const urlObj = new URL(
		url,
		typeof window !== "undefined"
			? window.location.origin
			: "http://localhost:3000"
	);
	urlObj.searchParams.set("page", params.page.toString());
	urlObj.searchParams.set("page_size", params.pageSize.toString());
	return urlObj.toString();
}

export function getPaginationParamsFromUrl(url: string): PaginationParams {
	const urlObj = new URL(
		url,
		typeof window !== "undefined"
			? window.location.origin
			: "http://localhost:3000"
	);
	const page = parseInt(urlObj.searchParams.get("page") || "1", 10);
	const pageSize = parseInt(urlObj.searchParams.get("page_size") || "10", 10);
	return createPaginationParams(page, pageSize);
}
