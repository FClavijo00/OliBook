import { HttpClient } from '@angular/common/http';
import { EventEmitter, inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Plot } from '../models/plots';
import { environment } from 'src/environments/environment';

export interface ObtenerParcelasRResponse {
  misParcelas: Plot[];
  parcelasEmpresa: Plot[];
}

@Injectable({
  providedIn: 'root',
})
export class PlotsService {

  private _apiUrl = `${environment.apiUrl}/parcelas`;
  private resfreshPlotsSource = new Subject<void>();
  refreshPlots$ = this.resfreshPlotsSource.asObservable();
  public plotsChanged = new EventEmitter<void>();

  private _http = inject(HttpClient)

  nuevaParcela(plot: Plot) : Observable<Plot> {
    return this._http.post<Plot>(`${this._apiUrl}/nuevaParcela`, plot);
  }

  editarParcela(plot: Plot) : Observable<Plot> {
    return this._http.post<Plot>(`${this._apiUrl}/editarParcela`, plot);
  }

  eliminarParcela(data: any) : Observable<Plot> {
    return this._http.post<Plot>(`${this._apiUrl}/eliminarParcela`, data);
  }

  eliminarCoordenadas(data: any) : Observable<Plot> {
    return this._http.post<Plot>(`${this._apiUrl}/eliminarCoordenadas`, data);
  }

  getPlots() : Observable<Plot[]> {
    return this._http.get<Plot[]>(`${this._apiUrl}/obtenerParcelas`);
  }

  obtenerParcelas(userID: any, empresaID: any){
    return this._http.post<ObtenerParcelasRResponse>(`${this._apiUrl}/obtenerParcelas`, 
      {userID: userID, empresaID: empresaID});
  }

  triggerRefreshPlots() {
    this.resfreshPlotsSource.next();
  }
  
}
