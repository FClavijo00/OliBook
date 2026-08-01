import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'plot-detail',
    loadComponent: () => import('./pages/plot-detail/plot-detail.page').then( m => m.PlotDetailPage)
  },
  {
    path: 'works',
    loadComponent: () => import('./pages/works/works.page').then( m => m.WorksPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },  {
    path: 'tipos-trabajos',
    loadComponent: () => import('./pages/tipos-trabajos/tipos-trabajos.page').then( m => m.TiposTrabajosPage)
  },

];
