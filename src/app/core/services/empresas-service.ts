import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmpresasService {

  private _apiUrl = `${environment.apiUrl}/users`;
  
  private _http = inject(HttpClient);

  obtenerEmpresaUsuario(id: number) {
    return this._http.post(`${this._apiUrl}/obtenerEmpresaUsuario`, {id: id});
  }
  
}
