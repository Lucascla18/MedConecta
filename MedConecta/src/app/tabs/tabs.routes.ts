import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./home/home.page').then((m) => m.HomePage), // Caminho com './'
      },
      {
        path: 'consultas',
        loadComponent: () =>
          import('./consultas/consultas.page').then((m) => m.ConsultasPage), // Caminho com './'
      },
      {
      path: 'profile',
      loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage),
    },
      {
        path: '',
        redirectTo: 'home', // Redireciona para a home DENTRO das tabs
        pathMatch: 'full',
      },
    ],
  },
];