export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ApiError[];
  statusCode: number;
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors: ApiError[];
  timestamp: Date;
  path: string;
}
