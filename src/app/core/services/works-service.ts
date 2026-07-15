import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { WorkDone, WorksCalendar, WorkTypes } from '../models/works';

@Injectable({
  providedIn: 'root',
})
export class WorksService {

  private _apiUrl = 'http://localhost:3000/api/test'
  private _http = inject(HttpClient)

  addWorkDone(work: WorkDone) {
    return this._http.post<WorksCalendar>(`${this._apiUrl}/addWorkDone`, work);
  }

  getLastWorks() {
    return this._http.get(`${this._apiUrl}/getLastWorks`);
  }

  getWorksCalendar() {
    return this._http.get<WorksCalendar[]>(`${this._apiUrl}/getWorksCalendar`);
  }

  getWorkTypes() {
    return this._http.get<WorkTypes[]>(`${this._apiUrl}/getWorkTypes`);
  }

  
}
