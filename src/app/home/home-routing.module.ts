import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { ContactDetailComponent } from '../components/contact-detail/contact-detail.component';

const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  {
    path: ':id',
    component:ContactDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
