import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UsersService {

  private apiUrl = 'http://localhost:3000/api/test';
  
  private _http = inject(HttpClient);

  getUsers() : Observable<User[]> {
    return this._http.get<User[]>(`${this.apiUrl}/getUsers`);
  }
}
