export interface User {
  _id: string;
  phone: string;
  name?: string;
  email?: string;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  token?: string;
  user?: User;
  needsRegistration?: boolean;
  message: string;
}

export interface CompleteRegistrationRequest {
  name: string;
  email: string;
}

export interface CompleteRegistrationResponse {
  success: boolean;
  user: User;
  message: string;
}

export interface AuthResponse {
  user: User;
}

