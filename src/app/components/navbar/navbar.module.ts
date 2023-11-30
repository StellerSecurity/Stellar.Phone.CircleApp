import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar.component';
import { NavbarBackBtn } from './directives/navbar-back-btn.directive';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [IonicModule, CommonModule],
  exports: [NavbarComponent, NavbarBackBtn],
  declarations: [NavbarComponent, NavbarBackBtn],
  providers: [],
})
export class NavbarModule {}
