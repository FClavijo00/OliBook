import { HttpClient } from '@angular/common/http';
import { EventEmitter, inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Plot } from '../models/plots';

@Injectable({
  providedIn: 'root',
})
export class PlotsService {

  private _apiUrl = 'http://localhost:3000/api/test'
  private resfreshPlotsSource = new Subject<void>();
  refreshPlots$ = this.resfreshPlotsSource.asObservable();
  public plotsChanged = new EventEmitter<void>();

  private _http = inject(HttpClient)

  addNewPlot(plot: Plot) : Observable<Plot> {
    return this._http.post<Plot>(`${this._apiUrl}/addPlot`, plot);
  }

  editPlot(plot: Plot) : Observable<Plot> {
    return this._http.post<Plot>(`${this._apiUrl}/editPlot`, plot);
  }

  deletePlot(data: any) : Observable<Plot> {
    return this._http.post<Plot>(`${this._apiUrl}/deletePlot`, data);
  }

  deletePlotCoords(data: any) : Observable<Plot> {
    return this._http.post<Plot>(`${this._apiUrl}/deletePlotCoords`, data);
  }

  getPlots() : Observable<Plot[]> {
    return this._http.get<Plot[]>(`${this._apiUrl}/getPlots`);
  }

  triggerRefreshPlots() {
    this.resfreshPlotsSource.next();
  }
  
}
