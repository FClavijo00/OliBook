import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { UsersService } from './core/services/users-service';
import { User } from './core/models/user';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent  {

  public user: User = environment.user;

  private _usersService = inject(UsersService);

  ngOnInit() {
    this._usersService.getUsers().subscribe((userData) => {
      if (userData && userData.length > 0) {
        this.user = userData[0];
        environment.user = this.user;
      }
    });
  }
}
