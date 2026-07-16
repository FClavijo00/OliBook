import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ProfilePage implements OnInit {
  public user = environment.user;

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

  ngOnInit() {}
}
