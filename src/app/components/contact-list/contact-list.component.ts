import {
  Component,
  OnChanges,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Circle } from 'src/app/models/circle.model';
import {AlertController, LoadingController} from "@ionic/angular";
import { CircledataService } from 'src/app/services/circledata.service';
import { WipeStatusEnum } from 'src/app/WipeStatusEnum';

@Component({
  selector: 'contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss'],
})
export class ContactListComponent {

  constructor(private alertController: AlertController, private loadingCtrl: LoadingController, private circleDataService: CircledataService) { }

  @Input() contacts: Circle[] = [];
  @Output() onClear = new EventEmitter<any>();
  @Output() onRemove = new EventEmitter<any>();
  @Output() onClick = new EventEmitter<any>();
  
  public async wipe(i: number) {
    const contact = this.contacts[i];
    
    const alert = await this.alertController.create({
      header: 'Warning',
      message: 'Are you sure you want to Wipe ' + contact.name + ' phone?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {

          }
        }, {
          text: 'Okay',
          id: 'confirm-button',
          handler: async () => {

            const loading = await this.loadingCtrl.create({
              message: 'Please wait...'
            });

            await loading.present();

            (await this.circleDataService.wipe(contact))
              .subscribe(async response => {

                await loading.dismiss();

                const alert = await this.alertController.create({
                  header: 'Wipe is set',
                  message: contact.name + ' has been set to be wiped. Notice: the phone must be online before its get wiped -- also we dont recieve a status if the phone has been wiped or not.',
                  buttons: ['OK'],
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
      header: 'Warning',
      message: 'Are you sure you want to remove ' + contact.name + ' from your contacts?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {

          }
        }, {
          text: 'Okay',
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
