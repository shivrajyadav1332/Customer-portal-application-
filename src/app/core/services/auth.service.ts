import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, SignupRequest, UserInfo } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<UserInfo | null>(
    this.getUserFromStorage()
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasValidToken()
  );
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: LoginResponse) => this.handleAuthResponse(response))
    );
  }

  signup(details: SignupRequest): Observable<LoginResponse> {
    return this.http.post<any>(`${this.apiUrl}/signup`, details).pipe(
      tap((response: LoginResponse) => this.handleAuthResponse(response))
    );
  }

  private handleAuthResponse(response: LoginResponse): void {
    if (response && response.token) {
      this.storeToken(response.token, response.refreshToken, response.expiresIn);
      if (response.user) {
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      }
      this.isAuthenticatedSubject.next(true);
    }
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  refreshToken(): Observable<LoginResponse> {
    return new Observable(observer => {
      const user = this.getUserFromStorage();
      if (user) {
        const token = localStorage.getItem('authToken');
        const mockResponse: LoginResponse = {
          token: 'token-' + Date.now(),
          refreshToken: 'refresh-' + Date.now(),
          expiresIn: 86400,
          user: user
        };

        this.storeToken(mockResponse.token, mockResponse.refreshToken, mockResponse.expiresIn);
        observer.next(mockResponse);
        observer.complete();
      } else {
        observer.error({ error: { message: 'No user found' } });
      }
    });
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  getCurrentUser(): UserInfo | null {
    return this.getUserFromStorage();
  }

  getCurrentUserValue(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private storeToken(token: string, refreshToken: string, expiresIn: number): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    const expiryTime = new Date().getTime() + (expiresIn * 1000);
    localStorage.setItem('tokenExpiry', expiryTime.toString());
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('authToken');
    const expiry = localStorage.getItem('tokenExpiry');

    if (!token || !expiry) {
      return false;
    }

    const expiryTime = parseInt(expiry, 10);
    return new Date().getTime() < expiryTime;
  }

  private getUserFromStorage(): UserInfo | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  private initializeAuth(): void {
    const user = this.getUserFromStorage();
    const isAuthenticated = this.hasValidToken();

    if (user && isAuthenticated) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }
}
