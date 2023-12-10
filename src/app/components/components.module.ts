import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { NavbarModule } from './navbar/navbar.module';
import { ButtonComponent } from './button/button.component';
import { ContactListComponent } from './contact-list/contact-list.component';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

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
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  exports: [
    ButtonComponent,
    ContactListComponent,
    NavbarModule
  ],
})
export class ComponentsModule {}
