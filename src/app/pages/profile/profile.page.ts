import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
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
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ProfilePage implements OnInit {

  public user: User | null = null;
  
  private _usersService = inject(UsersService);

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

  ngOnInit() {
    this.user = this._usersService.getUser();
  }
}
