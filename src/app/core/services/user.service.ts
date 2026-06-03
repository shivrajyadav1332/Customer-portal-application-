import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CustomerProfile, UpdateProfileRequest, UpdateCompanyDetailsRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getUserProfile(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

  updateUserProfile(userId: string, data: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/profile`, data);
  }

  getCustomerProfile(customerId: string): Observable<CustomerProfile> {
    return this.http.get<CustomerProfile>(`${this.apiUrl}/${customerId}/customer-profile`);
  }

  updateCustomerProfile(customerId: string, data: UpdateCompanyDetailsRequest): Observable<CustomerProfile> {
    return this.http.put<CustomerProfile>(`${this.apiUrl}/${customerId}/customer-profile`, data);
  }

  uploadProfileImage(userId: string, file: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<User>(`${this.apiUrl}/${userId}/upload-profile-image`, formData);
  }
}
