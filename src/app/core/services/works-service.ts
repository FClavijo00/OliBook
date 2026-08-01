import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { WorkDone, WorksCalendar, WorkTypes } from '../models/works';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WorksService {

  private _apiUrlTrabajos = `${environment.apiUrl}/trabajos`;
  private _apiUrlTipos = `${environment.apiUrl}/tipo-trabajos`;
  private _http = inject(HttpClient)

  addWorkDone(work: WorkDone) {
    return this._http.post<WorkDone>(`${this._apiUrlTrabajos}/addWorkDone`, work);
  }

  editWorkDone(work: WorkDone) {
    return this._http.post<WorkDone>(`${this._apiUrlTrabajos}/editWorkDone`, work);
  }

  deleteWorkDone(workID: number) {
    return this._http.post(`${this._apiUrlTrabajos}/deleteWorkDone`, {id: workID});
  }

  obtenerUltimosTrabajos() {
    return this._http.get(`${this._apiUrlTrabajos}/obtenerUltimosTrabajos`);
  }

  getWorksCalendar() {
    return this._http.get<WorksCalendar[]>(`${this._apiUrlTrabajos}/getWorksCalendar`);
  }

  getWorkTypes() {
    return this._http.get<WorkTypes[]>(`${this._apiUrlTrabajos}/getWorkTypes`);
  }

  obtenerTipos(userID: number) {
    return this._http.post<WorkTypes[]>(`${this._apiUrlTipos}/obtenerTiposTrabajos`, { userID: userID });
  }

  nuevoTipo(tipoTrabajo: WorkTypes) {
    return this._http.post(`${this._apiUrlTipos}/nuevoTipoTrabajo`, tipoTrabajo);
  }

  editarTipo(tipoTrabajo: WorkTypes) {
    return this._http.post(`${this._apiUrlTipos}/editarTipoTrabajo`, tipoTrabajo);
  }

  eliminarTipo(id: number) {
    return this._http.post(`${this._apiUrlTipos}/eliminarTipoTrabajo`, { id: id });
  }

  
}
