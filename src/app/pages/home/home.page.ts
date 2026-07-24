import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RefresherCustomEvent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bookOutline,
  menu,
  menuOutline,
  personCircle,
  personCircleOutline,
  timeOutline,
  addCircleOutline,
  leafOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { WorksService } from 'src/app/core/services/works-service';
import { firstValueFrom } from 'rxjs';
import { UsersService } from 'src/app/core/services/users-service';
import { User } from 'src/app/core/models/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class HomePage implements OnInit {
  welcomeMessage: string = '';

  public user: User | null = null;

  private _router = inject(Router);
  private _navCtrl = inject(NavController);
  private _worksService = inject(WorksService);
  private _userService = inject(UsersService);

  public lastWorks = [] as any;

  constructor() {
    addIcons({
      personCircle,
      personCircleOutline,
      menu,
      menuOutline,
      bookOutline,
      timeOutline,
      addCircleOutline,
      leafOutline,
      checkmarkCircleOutline,
    });
  }

  async getLastWorks(
    accion: 'inicio' | 'refresh',
    event?: RefresherCustomEvent,
  ) {

    await this.lastWorksFromAPI();

    if (accion === 'refresh' && event) {
      setTimeout(() => {
        event.target.complete();
      }, 1000);
    }
  }

  private async lastWorksFromAPI() {
    try {
      const response = await firstValueFrom(this._worksService.getLastWorks());
      this.lastWorks = response || [];
    } catch (error) {
      console.error('Error en la petición a la API:', error);
    }
  }

  abrirTab(tab: string) {
    switch (tab) {
      case 'parcelas':
        this._navCtrl.navigateForward('/tabs/plots');
        break;
      case 'trabajos':
        this._navCtrl.navigateForward('/tabs/works');
        break;
    }
  }

  openPlotsPage() {
    this._navCtrl.navigateForward('/tabs/plots');
  }

  ngAfterViewInit() {
    this.user = this._userService.getUser();

    if (!this.user) {
      this._router.navigate(['/login']);
    }
  }

  ngOnInit() {
    this.getLastWorks('inicio');
    const currentHour = new Date().getHours();

    if (currentHour > 7 && currentHour < 12) {
      this.welcomeMessage = 'Buenos Días,';
    } else if (currentHour > 13 && currentHour < 21) {
      this.welcomeMessage = 'Buenas Tardes,';
    } else {
      this.welcomeMessage = 'Buenas Noches,';
    }
  }
}
