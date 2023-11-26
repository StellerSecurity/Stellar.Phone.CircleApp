import {Component, Input, OnInit} from '@angular/core';
import {AlertController, LoadingController} from "@ionic/angular";
import {Circle} from "../models/circle.model";
import {CircledataService} from "../services/circledata.service";
import {WipeStatusEnum} from "../WipeStatusEnum";

@Component({
  selector: 'app-circles',
  templateUrl: './circles.component.html',
  styleUrls: ['./circles.component.scss'],
})
export class CirclesComponent {

  @Input() circle!: Circle;
  @Input() index!: number;

  constructor(private alertController: AlertController, private loadingCtrl: LoadingController, private circleDataService: CircledataService) { }


  public async wipe() {
    const alert = await this.alertController.create({
      header: 'Warning',
      message: 'Are you sure you want to Wipe ' + this.circle.name + ' phone?',
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

            (await this.circleDataService.wipe(this.circle))
              .subscribe(async response => {

                await loading.dismiss();

                const alert = await this.alertController.create({
                  header: 'Wipe is set',
                  message: this.circle.name + ' has been set to be wiped. Notice: the phone must be online before its get wiped -- also we dont recieve a status if the phone has been wiped or not.',
                  buttons: ['OK'],
                });

                await alert.present();

                this.circle.wipe_status = WipeStatusEnum.WIPING;

                await this.circleDataService.update(this.index, this.circle);

              });

          }
        }
      ]
    });

    await alert.present();
  }

  public async delete() {
    const alert = await this.alertController.create({
      header: 'Warning',
      message: 'Are you sure you want to remove ' + this.circle.name + ' from your contacts?',
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
            this.circleDataService.remove(this.index);
          }
        }
      ]
    });

    await alert.present();
  }

  protected readonly WipeStatusEnum = WipeStatusEnum;
}
