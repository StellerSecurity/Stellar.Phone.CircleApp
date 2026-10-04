import {WipeDialogService} from '../services/wipe-dialog.service';
import {Component, Input} from '@angular/core';
import {AlertController} from "@ionic/angular";
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

  constructor(private alertController: AlertController, private wipeDialog: WipeDialogService, private circleDataService: CircledataService) { }


  public async wipe() {
    await this.wipeDialog.confirm(this.circle);
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
