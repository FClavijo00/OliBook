import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { User, UserLogin, UserRegister } from '../models/user';
import { Router } from '@angular/router';

export interface LoginResponse {
  message: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {

  public currentUser = signal<User | null>(this.getUserFromStorage());

  private _apiUrl = 'http://localhost:3000/api/test';
  
  private _http = inject(HttpClient);
  private _router = inject(Router);

  login(loginData: UserLogin): Observable<LoginResponse> {
    return this._http.post<LoginResponse>(`${this._apiUrl}/login`, loginData).pipe(
      tap((response) => {
        console.log('Respuesta del login:', response);
        if (response && response.user) {
          console.log('Usuario logueado:', response.user);
          // Guardamos el usuario en el estado y en LocalStorage
          this.setCurrentUser(response.user);
        }
      })
    );
  }


  register(user: UserRegister): Observable<LoginResponse> {
    return this._http.post<LoginResponse>(`${this._apiUrl}/register`, user);
  }

  getUsers() : Observable<User[]> {
    return this._http.get<User[]>(`${this._apiUrl}/getUsers`);
  }

  // Establece el usuario en memoria y almacenamiento local
  setCurrentUser(user: User) {
    this.currentUser.set(user);
    localStorage.setItem('olibook_user', JSON.stringify(user));
  }

  // Obtiene el usuario actual
  getUser(): User | null {
    return this.currentUser();
  }

  // Para cerrar sesión
  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('olibook_user');
    this._router.navigate(['/login']);
  }

  private getUserFromStorage(): User | null {
    const savedUser = localStorage.getItem('olibook_user');
    return savedUser ? JSON.parse(savedUser) : null;
  }
}
