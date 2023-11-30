import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { NavbarModule } from './navbar/navbar.module';
import { ButtonComponent } from './button/button.component';
import { ContactListComponent } from './contact-list/contact-list.component';
@NgModule({
  declarations: [
    ButtonComponent,
    ContactListComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    RouterModule,
    CommonModule,
    NavbarModule,
  ],
  exports: [
    ButtonComponent,
    ContactListComponent,
    NavbarModule
  ],
})
export class ComponentsModule {}
