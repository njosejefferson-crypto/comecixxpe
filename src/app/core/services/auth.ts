import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, map, switchMap, throwError } from 'rxjs';
import { AuthUser, User } from '../../shared/models/user';

const API_URL = 'http://localhost:3001/users';
const STORAGE_KEY = 'ecommerce_current_user';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly currentUserSignal = signal<AuthUser | null>(this.readStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthUser> {
    return this.http.get<User[]>(`${API_URL}?email=${encodeURIComponent(email)}`).pipe(
      map((users) => {
        const user = users.find((u) => u.password === password);
        if (!user) {
          throw new Error('Correo o contraseña incorrectos.');
        }
        const { password: _password, ...authUser } = user;
        return authUser;
      }),
      map((authUser) => {
        this.setSession(authUser);
        return authUser;
      }),
    );
  }

  register(name: string, email: string, password: string): Observable<AuthUser> {
    return this.http.get<User[]>(`${API_URL}?email=${encodeURIComponent(email)}`).pipe(
      switchMap((existing) => {
        if (existing.length > 0) {
          return throwError(() => new Error('Ya existe una cuenta con ese correo.'));
        }
        return this.http.post<User>(API_URL, { name, email, password });
      }),
      map((user) => {
        const { password: _password, ...authUser } = user;
        this.setSession(authUser);
        return authUser;
      }),
    );
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private setSession(user: AuthUser): void {
    this.currentUserSignal.set(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  private readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }
}
