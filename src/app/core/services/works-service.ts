import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { WorkDone, WorksCalendar, WorkTypes } from '../models/works';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WorksService {

  private _apiUrl = `${environment.apiUrl}/trabajos`;
  private _http = inject(HttpClient)

  addWorkDone(work: WorkDone) {
    return this._http.post<WorkDone>(`${this._apiUrl}/addWorkDone`, work);
  }

  editWorkDone(work: WorkDone) {
    return this._http.post<WorkDone>(`${this._apiUrl}/editWorkDone`, work);
  }

  deleteWorkDone(workID: number) {
    return this._http.post(`${this._apiUrl}/deleteWorkDone`, {id: workID});
  }

  obtenerUltimosTrabajos() {
    return this._http.get(`${this._apiUrl}/obtenerUltimosTrabajos`);
  }

  getWorksCalendar() {
    return this._http.get<WorksCalendar[]>(`${this._apiUrl}/getWorksCalendar`);
  }

  getWorkTypes() {
    return this._http.get<WorkTypes[]>(`${this._apiUrl}/getWorkTypes`);
  }

  
}
