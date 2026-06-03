export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  customerId: string;
  role: UserRole;
  permissions: Permission[];
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface CustomerProfile {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId: string;
  industryType: string;
  isActive: boolean;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone: string;
  profileImage?: string;
}

export interface UpdateCompanyDetailsRequest {
  companyName: string;
  contactPerson: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export enum UserRole {
  Admin = 'Admin',
  Manager = 'Manager',
  Operator = 'Operator',
  Viewer = 'Viewer'
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}
