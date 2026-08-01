import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonList, IonListHeader, IonLabel, IonItem, IonIcon, NavController } from '@ionic/angular/standalone';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import {
  cloudDownloadOutline,
  helpCircleOutline,
  lockClosedOutline,
  logOutOutline,
  personOutline,
  settingsOutline,
} from 'ionicons/icons';
import { UsersService } from 'src/app/core/services/users-service';
import { User } from 'src/app/core/models/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonIcon, IonItem, IonLabel, IonListHeader, IonList, IonContent, IonTitle, IonToolbar, IonHeader,  CommonModule, FormsModule],
})
export class ProfilePage implements OnInit {

  public user: User | null = null;
  public iniciales: string = '';
  
  private _usersService = inject(UsersService);
  private _navCtrl = inject(NavController);

  constructor() {
    addIcons({
      personOutline,
      lockClosedOutline,
      cloudDownloadOutline,
      helpCircleOutline,
      logOutOutline,
      settingsOutline
    });
  }

  logout() {
    this._usersService.logout();
  }

  construirIniciales() {
    if (this.user) {
      const palabras = this.user.name.split(' ');
      this.iniciales = palabras.map((palabra) => palabra.charAt(0)).join('');
    }
  }

  seleccionarOpcion(opcion: string) {
    switch (opcion) {
      case 'logout':
        this.logout();
        break;

      case 'tipos-trabajos':
        this._navCtrl.navigateForward('/tipos-trabajos');
        break;
    }
  }

  ngOnInit() {
    this.user = this._usersService.getUser();
    this.construirIniciales();
  }
}
