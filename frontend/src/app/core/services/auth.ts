import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'tms_token';

  private readonly _token = signal<string | null>(this.getStoredToken());
  readonly token = computed(() => this._token());

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  login(data: { email: string; password: string }) {
    return this.http.post(`${environment.apiBaseUrl}/api/users/login`, data, { responseType: 'text' });
  }

  setToken(token: string) {
    // Keep both keys for compatibility with existing/newer code paths.
    localStorage.setItem('token', token);
    localStorage.setItem(this.tokenKey, token);
    this._token.set(token);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem(this.tokenKey);
    this._token.set(null);
    this.router.navigateByUrl('/login');
  }

  isAuthenticated(): boolean {
    return !!this._token();
  }

  getRole(): 'ADMIN' | 'TRAINER' | 'TRAINEE' | null {
    const t = this._token();
    if (!t) return null;

    try {
      const decoded = jwtDecode<{ role?: string }>(t);
      const role = decoded?.role;
      if (role === 'ADMIN' || role === 'TRAINER' || role === 'TRAINEE') return role;
      return null;
    } catch {
      return null;
    }
  }

  getEmail(): string | null {
    const t = this._token();
    if (!t) return null;
    try {
      const decoded = jwtDecode<{ sub?: string }>(t);
      return decoded?.sub ?? null;
    } catch {
      return null;
    }
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.tokenKey) ?? localStorage.getItem('token');
  }

  getUserId(): number | null {
    const t = this._token();
    if (!t) return null;
    try {
      const decoded = jwtDecode<{ userId?: number; id?: number; sub?: string }>(t);
      if (typeof decoded.userId === 'number') return decoded.userId;
      if (typeof decoded.id === 'number') return decoded.id;
      const maybeSub = Number(decoded.sub);
      return Number.isFinite(maybeSub) && maybeSub > 0 ? maybeSub : null;
    } catch {
      return null;
    }
  }
}
