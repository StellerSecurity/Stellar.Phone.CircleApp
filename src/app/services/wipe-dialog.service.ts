import {Injectable} from '@angular/core';
import {AlertController, LoadingController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {firstValueFrom} from 'rxjs';
import {Circle} from '../models/circle.model';
import {CircledataService} from './circledata.service';
import {WipeStatusEnum} from '../WipeStatusEnum';

@Injectable({providedIn: 'root'})
export class WipeDialogService {
  private busy = false;

  constructor(private alerts: AlertController, private loading: LoadingController,
    private translate: TranslateService, private circles: CircledataService) {}

  async confirm(contact: Circle): Promise<boolean> {
    if (this.busy || !contact || contact.wipe_status !== WipeStatusEnum.ACTIVE) return false;
    this.busy = true;
    const snapshot = {...contact};
    let spinner: HTMLIonLoadingElement | undefined;
    try {
      const confirmation = await this.alerts.create({
        cssClass: 'wipe-out-alert alert-with-icon',
        header: this.translate.instant('wipe_alert_header', {contactName: snapshot.name}),
        message: this.translate.instant('wipe_confirmation_message'),
        buttons: [
          {text: this.translate.instant('cancel_button'), role: 'cancel', cssClass: 'secondary'},
          {text: this.translate.instant('wipe_phone_button'), role: 'confirm', cssClass: 'danger'},
        ],
      });
      await confirmation.present();
      if ((await confirmation.onDidDismiss()).role !== 'confirm') return false;

      spinner = await this.loading.create({message: this.translate.instant('please_wait_message')});
      await spinner.present();
      await firstValueFrom(this.circles.wipe(snapshot));
      await this.circles.markWiping(snapshot.wipe_auth_token);
      contact.wipe_status = WipeStatusEnum.WIPING;
      await spinner.dismiss();
      spinner = undefined;
      const receipt = await this.alerts.create({
        cssClass: 'wipe-out-set alert-with-icon',
        header: this.translate.instant('wipe_set_header', {contactName: snapshot.name}),
        message: this.translate.instant('wipe_set_message'),
        buttons: [this.translate.instant('close_button')],
      });
      await receipt.present();
      return true;
    } catch {
      if (spinner) { await spinner.dismiss(); spinner = undefined; }
      const error = await this.alerts.create({
        header: this.translate.instant('error_title'),
        message: this.translate.instant('wipe_request_failed_message'),
        buttons: [this.translate.instant('close_button')],
      });
      await error.present();
      return false;
    } finally {
      if (spinner) await spinner.dismiss();
      this.busy = false;
    }
  }
}
