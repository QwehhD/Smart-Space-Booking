export interface ApiSuccessResponse<T> {
  status: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface ValidationErrorDetail {
  field: string;
  messages: string[];
}

export interface ApiErrorResponse {
  status: false;
  statusCode: number;
  message: string;
  error: string;
  errors?: ValidationErrorDetail[];
  timestamp: string;
}
