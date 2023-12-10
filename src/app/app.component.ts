import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  constructor(
    private storage: Storage,
    private translate: TranslateService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.setDefaultLanguage();
  }

  setDefaultLanguage() {
    let getDefaultLanguage = window.navigator.language;

    // List of supported languages
    const supportedLanguages = ['en-US', 'fr-FR', 'da-DK']; // Add your supported languages here.

    // Check if the detected language is supported.
    if (supportedLanguages.includes(getDefaultLanguage)) {
      this.translate.setDefaultLang(getDefaultLanguage);
    } else {
      // Fallback to English if the detected language is not supported.
      this.translate.setDefaultLang('en-US');
    }
  }

  async ngAfterViewInit() {
    // If using a custom driver:
    // await this.storage.defineDriver(MyCustomDriver)
    await this.storage.create();
  }

}
