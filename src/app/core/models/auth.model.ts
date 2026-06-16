export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupRequest {
  username: string;
  password: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: UserInfo;
  expiresIn: number;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  customerId: string;
  customerName: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
