import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UIService {
  // Usamos un Signal para que la detección de cambios sea automática y ultrarrápida
  public isLoading = signal(false);

  showLoading() {
    this.isLoading.set(true);
  }

  hideLoading() {
    // Un pequeño delay para evitar parpadeos, pero controlado
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1000); 
  }
  
}
