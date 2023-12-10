import {
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Circle } from 'src/app/models/circle.model';
import { AlertController, LoadingController } from "@ionic/angular";
import { CircledataService } from 'src/app/services/circledata.service';
import { WipeStatusEnum } from 'src/app/WipeStatusEnum';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
})
export class ContactListComponent {

  constructor(
    private alertController: AlertController,
    private loadingCtrl: LoadingController,
    private circleDataService: CircledataService,
    private translate: TranslateService
  ) { }

  @Input() contacts: Circle[] = [];
  @Output() onClear = new EventEmitter<any>();
  @Output() onRemove = new EventEmitter<any>();
  @Output() onClick = new EventEmitter<any>();

  public async wipe(i: number) {
    const contact = this.contacts[i];

    const alert = await this.alertController.create({
      header: this.translate.instant('wipe_confirmation_header'),
      message: this.translate.instant('wipe_confirmation_message', { contactName: contact.name }),
      buttons: [
        {
          text: this.translate.instant('cancel_button'),
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {

          }
        }, {
          text: this.translate.instant('okay_button'),
          id: 'confirm-button',
          handler: async () => {

            const loading = await this.loadingCtrl.create({
              message: this.translate.instant('please_wait_message')
            });

            await loading.present();

            (await this.circleDataService.wipe(contact))
              .subscribe(async response => {

                await loading.dismiss();

                const alert = await this.alertController.create({
                  header: this.translate.instant('wipe_set_header'),
                  message: this.translate.instant('wipe_set_message', { contactName: contact.name }),
                  buttons: [this.translate.instant('okay_button')],
                });

                await alert.present();

                contact.wipe_status = WipeStatusEnum.WIPING;

                await this.circleDataService.update(i, contact);

              });

          }
        }
      ]
    });

    await alert.present();
  }

  public async delete(i: number) {
    const contact = this.contacts[i];
    const alert = await this.alertController.create({
      header: this.translate.instant('delete_confirmation_header'),
      message: this.translate.instant('delete_confirmation_message', { contactName: contact.name }),
      buttons: [
        {
          text: this.translate.instant('cancel_button'),
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {

          }
        }, {
          text: this.translate.instant('okay_button'),
          id: 'confirm-button',
          handler: () => {
            this.circleDataService.remove(i);
          }
        }
      ]
    });

    await alert.present();
  }

  protected readonly WipeStatusEnum = WipeStatusEnum;
}
